import os
import numpy as np
import string
import random
import json

THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))


def main():
    # userNameGenerator()
    # emailGenerator()
    jsonBuilder()


def randomStringGenerator():
    letter = string.ascii_letters
    return ''.join(random.choice(letter) for i in range(10))


def userNameGenerator():
    my_file = os.path.join(THIS_FOLDER, 'result/converter_output.txt')
    output = open(my_file, "w")
    for i in range(400):
        output.write(str(randomStringGenerator())+"\n")

    output.close()


def emailGenerator():
    my_file = os.path.join(THIS_FOLDER, 'dataset/train/username.txt')
    f = open(my_file, "r")
    line = f.readlines()

    count = 0
    email = []
    randomEmail = ["@gmail.com", "@yahoo.com", "@outlook.com"]
    for text in line:
        newEmail = text.strip()+(random.choice(randomEmail))
        email.append(newEmail)

    f.close()

    output_file = os.path.join(THIS_FOLDER, 'result/converter_output.txt')
    output = open(output_file, "w")
    for i in email:
        output.write(str(i)+"\n")

    output.close()


def jsonBuilder():
    my_file = os.path.join(THIS_FOLDER, 'dataset/test/userNameEncrypted.txt')
    f = open(my_file, "r")
    line = f.readlines()
    
    emailSet = []
    for username in line:
        nameset = username.strip().split(",")
        dic = {
            "encrypted": nameset[0],
            "username": nameset[1],
          
        }
        emailSet.append(dic)

    f.close()

    output_file = os.path.join(THIS_FOLDER, 'result/encryptedUsername.json')
    output = open(output_file, "w")
    json.dump(emailSet, output)
    output.close()


main()
