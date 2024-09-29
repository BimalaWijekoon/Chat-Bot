from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments, AutoTokenizer
from datasets import load_from_disk
from transformers import EarlyStoppingCallback

# Load the tokenized dataset
tokenized_datasets = load_from_disk("./tokenized_emotion_data")  # Ensure this path is correct

# Load the pre-trained model for sequence classification
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=6)

# Load the tokenizer
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

# Define early stopping callback
early_stopping = EarlyStoppingCallback(early_stopping_patience=5)

# Define training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",  # Evaluate after each epoch
    save_strategy="epoch",  # Save model after each epoch
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=0.5,  # Set to a reasonable number of epochs
    weight_decay=0.01,
    load_best_model_at_end=True,  # Load best model at end of training
    metric_for_best_model="eval_loss",  # Metric to monitor
    greater_is_better=False,  # Lower is better for loss
)

# Initialize the Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    callbacks=[early_stopping],  # Include the callback
)

# Train the model
trainer.train()

# Save the fine-tuned model and tokenizer
trainer.save_model("./fine_tuned_emotion_model")
tokenizer.save_pretrained("./fine_tuned_emotion_model")
