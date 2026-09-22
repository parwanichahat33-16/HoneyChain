from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from app.services.predictor import predict

app = FastAPI(
    title="HoneyChain AI Service",
    description=(
        "AI-estimated hive health/disease-risk and honey-yield prediction. "
        "Prototype models trained on synthetic environmental/behavioral data — "
        "not a substitute for laboratory diagnosis or veterinary inspection."
    ),
    version="1.0.0",
)


class SensorInput(BaseModel):
    temperature: float = Field(..., description="Hive temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity percentage")
    weight: float = Field(..., description="Current hive weight in kg")
    weight_change: float = Field(0.0, description="Weight change since last reading, in kg")
    acoustic_level: float = Field(..., description="Acoustic/activity level, 0-100")
    colony_strength: float = Field(..., description="Colony strength indicator, 0-100")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "honeychain-ai-service"}


@app.post("/predict")
def predict_hive_health(input_data: SensorInput):
    try:
        result = predict(input_data.dict())
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
