import os
import joblib
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

_clf = None
_reg = None
_feature_order = None


def _load_models():
    global _clf, _reg, _feature_order
    if _clf is None:
        clf_path = os.path.join(MODEL_DIR, 'health_classifier.joblib')
        reg_path = os.path.join(MODEL_DIR, 'yield_regressor.joblib')
        feat_path = os.path.join(MODEL_DIR, 'feature_order.joblib')
        if not (os.path.exists(clf_path) and os.path.exists(reg_path)):
            raise RuntimeError(
                'Models not found. Run: python app/services/train_models.py'
            )
        _clf = joblib.load(clf_path)
        _reg = joblib.load(reg_path)
        _feature_order = joblib.load(feat_path)
    return _clf, _reg, _feature_order


RECOMMENDATIONS = {
    'high_risk': 'Inspect hive within 24 hours. Abnormal temperature, weight, or acoustic indicators detected.',
    'medium_risk': 'Monitor hive closely over the next few days. Consider a routine inspection.',
    'healthy': 'Environmental conditions are favorable. Continue routine monitoring.',
}


def predict(payload: dict) -> dict:
    clf, reg, feature_order = _load_models()

    x = np.array([[payload[f] for f in feature_order]])

    # Disease risk as a 0-100 score derived from class probabilities
    proba = clf.predict_proba(x)[0]
    classes = list(clf.classes_)
    risk_weight = {'healthy': 10, 'medium_risk': 50, 'high_risk': 90}
    disease_risk = float(sum(p * risk_weight[c] for p, c in zip(proba, classes)))
    disease_risk = round(min(max(disease_risk, 0), 99), 1)

    health_status = clf.predict(x)[0]

    predicted_yield = float(reg.predict(x)[0])
    predicted_yield = round(max(predicted_yield, 0.5), 1)

    recommendation = RECOMMENDATIONS.get(health_status, RECOMMENDATIONS['healthy'])

    return {
        'disease_risk': disease_risk,
        'health_status': health_status,
        'predicted_yield': predicted_yield,
        'recommendation': recommendation,
    }
