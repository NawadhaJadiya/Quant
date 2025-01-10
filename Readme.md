# Quant

*Project Link*: [Quant AI](https://quant-ai.vercel.app/)  
*YouTube Demo*: [Watch Here](https://youtu.be/QovqIPYbpAg)

---

## Description
*Quant* is a powerful tool designed to analyze social media accounts for engagement and reach. It provides users with actionable insights to improve their social media presence. By simply entering a username, Quant automates the process of reviewing posts and analyzing account activity, saving users from the tedious task of manual evaluation.

---

## Key Features

- Analyze real-time data of social media accounts and posts.
- Generate insights for improving engagement and reach.
- Provide relevant analysis points based on social media presence.
- Simplify the process of social media evaluation with minimal user input.

---

## Purpose
Quant was created to address the challenges users face when trying to manually review and optimize their social media performance. With Quant, users gain a comprehensive understanding of their social media metrics and receive suggestions to enhance their online visibility.

---

## Installation Instructions

### Tools Required

- *LangFlow*: Set up an account and connect it to DataStax Astra.
- *DataStax Astra*: Use it to manage and create a vector database.

### Steps

1. Set up a LangFlow account and connect it with your DataStax Astra database.
2. Create a vector database in DataStax Astra.
3. Provide the appropriate prompt to the LangFlow model.
4. Clone the project repository and navigate to the project directory:
   bash
   git clone https://github.com/NawadhaJadiya/Quant
   cd Quant
   
5. Install the required dependencies:
   bash
   pip install -r requirements.txt
   
6. Start the application and follow the instructions to integrate the frontend.

---

## Environment Variables

The following environment variables need to be configured for the application to run:

- PORT: The port number the application will run on.
- BASE_API_URL: The base URL for the API.
- LANGFLOW_ID: Your LangFlow ID.
- FLOW_ID: The Flow ID for LangFlow.
- APPLICATION_TOKEN: The application token for authentication.
- APIFY_API_TOKEN: The API token for Apify.
- ASTRAPY_API_TOKEN: The API token for AstraPy.
- GEMINI_API_KEY: The API key for Gemini.

---

## Usage

Quant can be used by anyone with a public social media account. To get started:

1. Enter the profile URL of the social media account you wish to analyze.
2. Interact with the chatbot by asking questions about your social media performance.
3. Receive detailed insights and suggestions for improvement.

---

## Example Questions

- "What is the engagement rate of my posts?"
- "How can I improve my reach?"
- "Which post has the best performance?"

---

## Tech Stack

- *Database*: Astra DB, DataStax
- *Backend*: Python (FastAPI Framework)
- *Frontend*: JavaScript, React
- *Integration*: LangFlow

---

## Contributing

We welcome contributions to enhance Quant. To contribute:

1. Clone the repository:
   bash
   git clone https://github.com/NawadhaJadiya/Quant
   
2. Create a Virtual Environment to manage dependencies:
   bash
   python -m venv env
   
3. Activate the virtual environment:
   - On Windows:
     bash
     source env/Scripts/activate
     
   - On Mac/Linux:
     bash
     source env/bin/activate
     
4. Fork the repository.
5. Create a feature branch:
   bash
   git checkout -b feature-name
   
6. Commit your changes:
   bash
   git commit -m 'Add feature'
   
7. Push the branch:
   bash
   git push origin feature-name
   
8. Open a pull request.

---

## Acknowledgments

Thanks to *LangFlow* and *DataStax* for providing the tools to power Quant’s database and AI functionalities. Credit to the open-source libraries and frameworks used in the project.

---

## Contact

For questions, suggestions, or feedback, feel free to contact us at *nawadhajadiya@gmail.com*.