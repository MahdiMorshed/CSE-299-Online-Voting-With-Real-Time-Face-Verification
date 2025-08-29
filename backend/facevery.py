from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
from keras.saving import register_keras_serializable
from mtcnn import MTCNN

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


detector = MTCNN()


@register_keras_serializable()
class L1Dist(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def call(self, inputs):
        input_embedding, validation_embedding = inputs
        return tf.math.abs(input_embedding - validation_embedding)

try:
    model = tf.keras.models.load_model(
        'siamesemodel.keras',
        compile=False,
        custom_objects={'L1Dist': L1Dist}
    )
    print(" Model loaded successfully")
except Exception as e:
    print(" Error loading model:", str(e))
    raise e


def process_face(image_bytes):
    """Process an image: detect face, crop, resize to 100x100, normalize."""
    img_array = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Image decoding failed")

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    faces = detector.detect_faces(img_rgb)
    if not faces:
        raise ValueError("No face detected")

    x, y, w, h = faces[0]['box']
    x, y = max(0, x), max(0, y)
    x2, y2 = x + w, y + h
    x2 = min(x2, img_rgb.shape[1])
    y2 = min(y2, img_rgb.shape[0])

    face_crop = img_rgb[y:y2, x:x2]

    face_tensor = tf.convert_to_tensor(face_crop, dtype=tf.uint8)

    face_tensor = tf.image.resize(face_tensor, (100, 100))
    face_tensor = tf.cast(face_tensor, tf.float32) / 255.0

    return tf.expand_dims(face_tensor, axis=0) 


def save_debug_image(img_tensor, filename):
    """Save a TensorFlow tensor as an image file for debugging."""
    img_uint8 = (img_tensor.numpy() * 255).astype(np.uint8)
    img_bgr = cv2.cvtColor(img_uint8, cv2.COLOR_RGB2BGR)
    cv2.imwrite(filename, img_bgr)


@app.route('/verify', methods=['POST'])
def verify():
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({'error': 'Please upload both images'}), 400

    try:
        img1 = process_face(request.files['image1'].read())
        img2 = process_face(request.files['image2'].read())

        print(f"Predicting on shapes: {img1.shape}, {img2.shape}")
        pred = model.predict([img1, img2])[0][0]
        is_match = pred > 0.5
        print(f"Predicted similarity: {pred}")

        save_debug_image(img1[0], "debug_img1.jpg")
        save_debug_image(img2[0], "debug_img2.jpg")

        return jsonify({
            'similarity': round(float(pred), 4),
            'match': bool(is_match),
            'threshold': 0.1
        })

    except Exception as e:
        print("Error in /verify:", str(e))
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
