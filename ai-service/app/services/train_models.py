"""
Trains the two HoneyChain AI models on synthetic-but-realistic hive data:

1. Disease/health-risk classifier (RandomForestClassifier)
2. Honey yield regressor (RandomForestRegressor)

This is a hackathon prototype: the synthetic data encodes plausible
domain rules (e.g. high temperature + weight loss + low acoustic
activity => higher risk) so the model demonstrates real predictive
behavior. For real-world deployment this MUST be retrained on field
data collected from actual beekeeping clusters.

Run: python app/services/train_models.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

np.random.seed(42)
N = 4000

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)


def generate_synthetic_data(n=N):
    temperature = np.random.normal(34, 3, n).clip(28, 42)
    humidity = np.random.normal(58, 12, n).clip(30, 95)
    weight = np.random.normal(45, 10, n).clip(15, 65)
    weight_change = np.random.normal(0, 2.5, n).clip(-10, 10)
    acoustic_level = np.random.normal(75, 18, n).clip(0, 100)
    colony_strength = np.random.normal(75, 18, n).clip(0, 100)

    # Domain-informed risk score (0-100), then binarized into 3 classes
    risk_score = (
        (temperature - 34).clip(min=0) * 8
        + (-weight_change).clip(min=0) * 6
        + (60 - acoustic_level).clip(min=0) * 0.6
        + (60 - colony_strength).clip(min=0) * 0.5
        + np.random.normal(0, 8, n)
    ).clip(0, 100)

    health_status = pd.cut(
        risk_score, bins=[-1, 35, 70, 101], labels=['healthy', 'medium_risk', 'high_risk']
    )

    # Yield depends positively on weight/colony strength, negatively on risk
    predicted_yield = (
        0.18 * weight
        + 0.05 * colony_strength
        - 0.05 * risk_score
        + np.random.normal(0, 1.2, n)
    ).clip(0.5, 20)

    df = pd.DataFrame({
        'temperature': temperature,
        'humidity': humidity,
        'weight': weight,
        'weight_change': weight_change,
        'acoustic_level': acoustic_level,
        'colony_strength': colony_strength,
        'risk_score': risk_score,
        'health_status': health_status,
        'yield_kg': predicted_yield,
    })
    return df


def train():
    df = generate_synthetic_data()
    features = ['temperature', 'humidity', 'weight', 'weight_change', 'acoustic_level', 'colony_strength']

    X = df[features]
    y_class = df['health_status']
    y_reg = df['yield_kg']

    X_train, X_test, yc_train, yc_test = train_test_split(X, y_class, test_size=0.2, random_state=42)
    _, _, yr_train, yr_test = train_test_split(X, y_reg, test_size=0.2, random_state=42)

    clf = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
    clf.fit(X_train, yc_train)
    print('Disease-risk classifier accuracy:', clf.score(X_test, yc_test))

    reg = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42)
    reg.fit(X_train, yr_train)
    print('Yield regressor R^2:', reg.score(X_test, yr_test))

    joblib.dump(clf, os.path.join(MODEL_DIR, 'health_classifier.joblib'))
    joblib.dump(reg, os.path.join(MODEL_DIR, 'yield_regressor.joblib'))
    joblib.dump(features, os.path.join(MODEL_DIR, 'feature_order.joblib'))
    print('✅ Models saved to', MODEL_DIR)


if __name__ == '__main__':
    train()
