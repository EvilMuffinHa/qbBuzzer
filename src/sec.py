from Crypto.Hash import SHA256, SHA3_256, SHAKE128
import secrets
from string import ascii_letters, digits
from binascii import hexlify


def gencode(n):
	return ''.join([secrets.choice(ascii_letters + digits) for i in range(n)])


def sha256(val):
	h = SHA256.new()
	h.update(bytes(str(val).encode('utf-8')))
	return h.digest()


def sha3256(val):
	ho = SHA3_256.new()
	ho.update(bytes(str(val).encode('utf-8')))
	return ho.digest()


def whitelist():
	return list(ascii_letters + digits)


def hexdigest(val):
	return hexlify(val).decode('utf-8')


def shake(val, n):
	xh = SHAKE128.new()
	xh.update(val)
	return xh.read(n)


def dohash(val):
	return hexdigest(shake(sha3256(sha256(val)), 7))
