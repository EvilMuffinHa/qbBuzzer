from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
	return "in progress!"

if __name__ == "__main__":
	app.run()