from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet


class ActionSuggestTherapist(Action):
    def name(self) -> Text:
        return "action_suggest_therapist"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Code to suggest therapists or mental health resources
        dispatcher.utter_message(text="I can suggest a few therapists near your area. Would you like to hear them?")
        return []


class ActionCheckSeverity(Action):
    def name(self) -> Text:
        return "action_check_severity"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Code to check severity and decide next steps
        severity = tracker.get_slot('severity')
        if severity and severity > 7:
            dispatcher.utter_message(
                text="It seems like you're in a critical situation. Please reach out to a professional immediately.")
        else:
            dispatcher.utter_message(text="I am here for you. Please continue talking to me.")
        return []


class ActionMotivateUser(Action):
    def name(self) -> Text:
        return "action_motivate_user"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Provide motivational quotes or messages
        motivational_quotes = [
            "Believe in yourself, take on your challenges, dig deep within yourself to conquer fears.",
            "You are capable of amazing things. Keep going!",
            "Every day may not be good, but there's something good in every day."
        ]
        dispatcher.utter_message(text=motivational_quotes[0])
        return []

# Additional custom actions can be defined as needed.
