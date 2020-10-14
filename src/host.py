from flask_wtf import FlaskForm
from wtforms import IntegerField, SubmitField
from wtforms.validators import DataRequired
class HostForm(FlaskForm):
	tossup = IntegerField('Tossup Points', validators=[DataRequired()])
	bonus = IntegerField('Bonus Points', validators=[DataRequired()])
	power = IntegerField('Power Points', validators=[DataRequired()])
	negs = IntegerField('Neg Points [Positive]', validators=[DataRequired()])
	create = SubmitField('Create Room')