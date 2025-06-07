{
  "_id": "6844078884c381b601c8d428",
  "id": "c0e8fe73-2a93-4b4d-9977-5d418b9a3ac1",
  "name": null,
  "description": null,
  "workflow_id": null,
  "workflow_type": "nlp_query",
  "query": "Login to CargoWise with username: john.doe and password: secure123 environment: web",
  "parameters": {
    "username": "john.doe",
    "password": "secure123",
    "environment": "web"
  },
  "tools": [
    {
      "name": "cargowise_login",
      "description": "Log into CargoWise",
      "parameters": {
        "username": "john.doe",
        "password": "secure123",
        "environment": "web"
      }
    }
  ],
  "context": {
    "intent": "cargowise_login",
    "confidence": 0.95,
    "marc1_intent": {
      "intent_name": "cargowise_login",
      "confidence": 0.95,
      "parameters": {
        "username": "john.doe",
        "password": "secure123",
        "environment": "web"
      },
      "raw_query": "Login to CargoWise with username: john.doe and password: secure123 environment: web",
      "extracted_at": "2025-06-07T09:26:23.466793"
    }
  },
  "metadata": {},
  "current_state": {
    "task_id": "c0e8fe73-2a93-4b4d-9977-5d418b9a3ac1",
    "status": "COMPLETED",
    "step_index": 0,
    "current_tool": null,
    "parameters": {
      "username": "john.doe",
      "password": "secure123",
      "environment": "web"
    },
    "outputs": {
      "logged_in": true,
      "username": "john.doe",
      "environment": "web"
    },
    "error": null,
    "context": {
      "intent": "cargowise_login",
      "confidence": 0.95,
      "marc1_intent": {
        "intent_name": "cargowise_login",
        "confidence": 0.95,
        "parameters": {
          "username": "john.doe",
          "password": "secure123",
          "environment": "web"
        },
        "raw_query": "Login to CargoWise with username: john.doe and password: secure123 environment: web",
        "extracted_at": "2025-06-07T09:26:23.466793"
      }
    },
    "updated_at": "2025-06-07T09:26:23.880Z",
    "requires_approval": false,
    "metadata": {
      "execution_start_time": "2025-06-07T09:26:24.126178",
      "current_step": 0,
      "total_steps": 1,
      "last_update": "2025-06-07T09:27:42.938200"
    }
  },
  "history": [],
  "created_at": "2025-06-07T09:26:22.853Z",
  "updated_at": "2025-06-07T10:27:43.021584",
  "completed_at": "2025-06-07T09:27:42.987Z",
  "user_id": "84f91fce-e48d-4491-963d-6267cc555141",
  "client_id": "e8148cde-25dd-408a-918d-f5ad4bbd7db5"
}
