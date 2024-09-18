# prepare_data.py
from datasets import load_dataset
from transformers import AutoTokenizer

# Load the Emotion dataset
dataset = load_dataset("emotion")

# Initialize the tokenizer
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

# Function to tokenize data
def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

# Tokenize the dataset
tokenized_datasets = dataset.map(tokenize_function, batched=True)

# Save the tokenized datasets for later use
tokenized_datasets.save_to_disk("./tokenized_emotion_data")
