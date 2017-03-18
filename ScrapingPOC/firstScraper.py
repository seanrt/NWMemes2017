import re
import requests
from bs4 import BeautifulSoup

# HASHTAGS_TO_SEARCH = ['dank','memes','pepe']
HASHTAGS_TO_SEARCH = ['Memes']
CITY_TO_SEARCH = 'Vancouver'
DISTANCE_TO_SEARCH_IN_MILES = '500'

def hashtagListToURLstringQuery(hashtags):
    query = ''
    for tag in hashtags[:-1]:
        query += '%23'+tag+'%2C%20OR%20'
    query += '%23'+hashtags[len(hashtags)-1]
    return query

def removeURLsFromTweets(tweet):
    tweet = re.sub(r"http\S+", "", tweet)
    return tweet

def cleanUpRawTweets(tweet):
    tweet = removeURLsFromTweets(tweet)
    tweet = tweet.replace('\n',' ')
    # tweet = tweet.encode('utf-8', 'ignore').decode('utf-8')
    # tweet = tweet.encode('utf-8')
    tweet = tweet.encode('ascii', 'ignore').decode('ascii')
    return tweet

query = hashtagListToURLstringQuery(HASHTAGS_TO_SEARCH)
twitterURL = 'https://twitter.com/search?vertical=default&q='+query+'%20near%3A%22'+CITY_TO_SEARCH+'%22%20within%3A'+DISTANCE_TO_SEARCH_IN_MILES+'mi'

r = requests.get(twitterURL)
soup = BeautifulSoup(r.text, 'html.parser')

tweets = [cleanUpRawTweets(p.text) for p in soup.findAll('p', class_='tweet-text')]
for tweet in tweets:
    print(tweet)
