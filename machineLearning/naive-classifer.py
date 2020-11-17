import os
import re
import numpy as np
import json

THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))


def main():
    readFile()


def readFile():
    negativeReview = {}
    positiveReview = {}

    my_file = os.path.join(THIS_FOLDER, 'dataset/train/trainset.txt')

    files = open(my_file, "r")
    lines = files.readlines()
    # print(lines)
    row = []
    negReviewCount = 0
    posReviewCount = 0
    for line in lines:
        rowElement = line.split(",")
        rowElementcopy = rowElement[3:]
        # print(''.join(rowElementcopy))
        reviewList = ''.join(rowElementcopy)
        reveiwArr = []
        word1 = re.split("[^a-zA-Z]", reviewList)

        for word in word1:
            if len(word) > 0:
                reveiwArr.append(word.lower())

        if("__label__1" in line):
            negReviewCount = negReviewCount + 1

            for word in reveiwArr:
                if(word in negativeReview):
                    negativeReview.update({word: negativeReview[word] + 1})
                else:
                    negativeReview.update({word: 1})

        if("__label__2" in line):
            posReviewCount = posReviewCount + 1

            for word in reveiwArr:
                if(word in positiveReview):
                    positiveReview.update({word: positiveReview[word] + 1})
                else:
                    positiveReview.update({word: 1})

    files.close()

    # Rerrange the dataset for smoothing
    for data in positiveReview:
        if(data not in negativeReview):
            negativeReview.update({data: 0})
    for data in negativeReview:
        if(data not in positiveReview):
            positiveReview.update({data: 0})

    print("postive review", posReviewCount)
    print("neagative review", negReviewCount)
    bagsProbability(negativeReview, positiveReview,
                    posReviewCount, negReviewCount)


def bagsProbability(negReview, posReview, posReviewCount, negReviewCount):
    posReviewLen = 0
    negReviewLen = 0
    posReviewProb = {}
    negReviewProb = {}
    smoothing = 0.5

    totalReviews = posReviewCount + negReviewCount

    # total words in +Ve and -Ve training set
    uniqueWords = len(posReview)
    for word in negReview:
        if word not in posReview:
            uniqueWords = uniqueWords + 1

    print(uniqueWords)
    # find total word frequence in ham dictionary
    for freq in posReview:
        posReviewLen = posReviewLen + posReview[freq]

    # find total word frequence in spam dictionary
    for freq in negReview:
        negReviewLen = negReviewLen + negReview[freq]

    # p(word | postiveReview)
    for i in posReview:
        posReviewProb.update(
            {i: (posReview[i] + smoothing)/(posReviewLen + (smoothing * uniqueWords))})

    # p(word | negativeReview)
    for i in negReview:
        negReviewProb.update(
            {i: (negReview[i] + smoothing)/(negReviewLen + (smoothing * uniqueWords))})

    testModule(posReviewProb, negReviewProb, posReviewCount, negReviewCount,
               totalReviews, posReviewLen, negReviewLen, uniqueWords)


def testModule(posReviewProb, negReviewProb, posReviewCount, negReviewCount, totalReviews, posReviewLen, negReviewLen, uniqueWords):
    my_file = os.path.join(THIS_FOLDER, 'dataset/test/testset.txt')
    testPosReviewCount = 0
    testNegReviewCount = 0
    negReviewScore = 0
    posReviewScore = 0
    ModuleArray = []
    files = open(my_file, "r")
    lines = files.readlines()
    whiteListedEmails = ["gmail.com", "yahoo.com", "outlook.com"]
    for line in lines:
        rowElement = line.split(",")
        rowElementcopy = rowElement[3:]

        rewiewList = ''.join(rowElementcopy)
        reveiwArr = []

        word1 = re.split("[^a-zA-Z]", rewiewList)

        for word in word1:
            if len(word) > 0:
                reveiwArr.append(word.lower())

        posReviewScore = posReviewScore + np.log(posReviewCount/totalReviews)
        negReviewScore = negReviewScore + np.log(negReviewCount/totalReviews)

        # vulnerability check for email
        emailDomain = ""
        if "@" in rowElement[2]:
            emailDomain = rowElement[2].split("@")[1]

        if(emailDomain in whiteListedEmails):
            status = "authorised"
            for word in reveiwArr:
                if word in posReviewProb:
                    posReviewScore = posReviewScore + \
                        np.log(posReviewProb[word])
                    negReviewScore = negReviewScore + \
                        np.log(negReviewProb[word])

        else:
            status = "malicious"

        # result = str(status)+","+line.strip
        # ModuleArray.append(result)

        outputJsonDic = {
            "label": rowElement[0],
            "username": rowElement[1],
            "email": rowElement[2],
            "review": rewiewList.strip(),   
            "status": status
        }
        ModuleArray.append(outputJsonDic)
    # output_file = os.path.join(THIS_FOLDER, 'result/classifierOutput.txt')
    # output = open(output_file, "w")
    # for i in ModuleArray:
    #     output.write(str(i)+"\n")
    # output.close()

    output_file = os.path.join(THIS_FOLDER, 'result/classifierOutput.json')
    output = open(output_file, "w")
    json.dump(ModuleArray, output)
    output.close()


main()
