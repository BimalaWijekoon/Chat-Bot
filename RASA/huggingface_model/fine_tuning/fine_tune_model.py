from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments
from transformers import AutoTokenizer
from datasets import load_from_disk
from transformers import EarlyStoppingCallback

# Load the tokenized dataset
tokenized_datasets = load_from_disk("./tokenized_emotion_data")

# Load the pre-trained model for sequence classification
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=6)

early_stopping = EarlyStoppingCallback(early_stopping_patience=5)

# Define training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",  # Use "epoch" to evaluate after each epoch
    save_strategy="epoch",  # Ensure saving strategy is also "epoch"
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=0.5,
    weight_decay=0.01,
    load_best_model_at_end=True,  # Enable loading the best model at the end
    metric_for_best_model="eval_loss",  # Metric to monitor for early stopping
    greater_is_better=False,  # Whether the metric should increase or decrease
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

# Save the fine-tuned model
trainer.save_model("./fine_tuned_emotion_model")
