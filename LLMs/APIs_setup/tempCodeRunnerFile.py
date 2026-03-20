from google import genai
client = genai.Client(
    api_key="AIzaSyApTjwCdtjhKzKzwwUO3hr9UEkXoyU4YSs"
)

response = client.models.generate_content(
    model="gemini-2.5-flash", contents=input("How can i help you?")
)
print(response.text)