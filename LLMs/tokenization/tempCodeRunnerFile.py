import tiktoken

encoder=tiktoken.encoding_for_model("gpt-4o")

text=input("Enter the text:")
tokens=encoder.encode(text)

print("Tokens",tokens)
# output:
# Tokens [25216, 3274, 0, 220, 3673, 1308, 382, 39738, 806]

# now doing reverse:
decoded=encoder.decode([25216, 3274, 0, 220, 3673, 1308, 382, 39738, 806])
print("Decoded",decoded)