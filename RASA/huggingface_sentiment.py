from rasa.engine.recipes.default_recipe import DefaultV1Recipe
from rasa.engine.graph import GraphComponent, ExecutionContext
from rasa.engine.storage.storage import ModelStorage
from rasa.engine.storage.resource import Resource
from rasa.shared.nlu.training_data.message import Message
from rasa.shared.nlu.training_data.training_data import TrainingData
from rasa.shared.nlu.constants import TEXT
from transformers import pipeline
from typing import Any, Dict, List, Text


@DefaultV1Recipe.register(
    DefaultV1Recipe.ComponentType.MESSAGE_FEATURIZER, is_trainable=False
)
class HuggingFaceSentimentComponent(GraphComponent):

    def __init__(self, config: Dict[Text, Any]) -> None:
        """Initialize the sentiment component."""
        self.sentiment_pipeline = pipeline("sentiment-analysis", model="./huggingface_model/fine_tuning/fine_tuned_emotion_model")

    @classmethod
    def create(
            cls, config: Dict[Text, Any], model_storage: ModelStorage, resource: Resource,
            execution_context: ExecutionContext
    ) -> GraphComponent:
        return cls(config)

    def process(self, messages: List[Message]) -> List[Message]:
        """Process incoming messages and apply sentiment analysis."""
        for message in messages:
            user_text = message.get(TEXT)
            sentiment_result = self.sentiment_pipeline(user_text)[0]
            message.set(
                "entities",
                [{"entity": "sentiment", "value": sentiment_result["label"], "confidence": sentiment_result["score"]}]
            )
        return messages

    def process_training_data(self, training_data: TrainingData) -> TrainingData:
        """Process the training data and return it unchanged, as sentiment analysis is not needed during training."""
        return training_data

    @classmethod
    def required_packages(cls) -> List[Text]:
        """Specify which packages are required to run this component."""
        return ["transformers"]
