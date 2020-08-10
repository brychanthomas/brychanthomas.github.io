from math import factorial
from decimal import *

getcontext().prec = 32

#calculate number of binary permutations given total people and number of sick people
#equation source: https://stackoverflow.com/questions/23228103/unique-permutations-of-binary-numbers
def calculatePerms(numPeople, sickPeople):
    try:
        return factorial(numPeople) / (factorial(sickPeople) * factorial(numPeople-sickPeople))
    except OverflowError:
        return factorial(numPeople) // (factorial(sickPeople) * factorial(numPeople-sickPeople))

#calculate the probability that at least one of a group of people is ill using the fraction that are ill overall
def calculateProbability(fractionSick, numPeople):
    prob = 0
    for numSick in range(1, numPeople):
        perms = calculatePerms(numPeople, numSick)
        prob += Decimal((fractionSick**numSick) * (1-fractionSick)**(numPeople-numSick))*Decimal(perms)
    prob += Decimal(fractionSick**numPeople)
    return prob

CASES_PER_DAY = 15 / 7 #744 #4 / 7
SYMPTOMS_LENGTH = 10;
POPULATION = 479000 #56287000 #132165
ASYMPTOMATIC = 0.79

numPeople = 1000 #int(10320811 / 32770) #int(input("How many people will be at the gathering? "))
peopleSickAtOnce = CASES_PER_DAY * SYMPTOMS_LENGTH
fractionSick = peopleSickAtOnce / POPULATION
print(str(fractionSick*100)+"% of people are ill.")
print(fractionSick*numPeople, "people are likely to be ill at the gathering.")
print("There is a", str(round(calculateProbability(fractionSick, numPeople)*100, 4))+"% chance at least person will be ill.")
print("There is a", str(round(calculateProbability(fractionSick*ASYMPTOMATIC, numPeople)*100, 4))+"% chance at least one person is an asymptomatic carrier.")
