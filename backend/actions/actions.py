# actions.py

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests

class ActionGetTime(Action):
    def name(self):
        return "action_get_time"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: dict) -> list:
        from datetime import datetime
        now = datetime.now()
        current_time = now.strftime("%H:%M:%S")
        dispatcher.utter_message(text=f"The current time is {current_time}")
        return []

class ActionGetWeather(Action):
    def name(self):
        return "action_get_weather"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: dict) -> list:
        # Example of fetching weather (replace with real API call)
        weather = "sunny with a chance of rain"
        dispatcher.utter_message(text=f"The current weather is {weather}")
        return []
