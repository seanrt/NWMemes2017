#!/usr/bin/python

import re
import psycopg2
import requests
from bs4 import BeautifulSoup
from datetime import datetime

HASHTAGS_TO_SEARCH = ['dank','memes','meme','pepe','doge']
DISTANCE_TO_SEARCH_IN_MILES = '100'

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
    tweet = re.sub(r"pic.twitter.com\S+", '', tweet)
    tweet = removeURLsFromTweets(tweet)
    tweet = tweet.replace('\n',' ')
    tweet = tweet.replace("'", '')
    # tweet = tweet.encode('utf-8', 'ignore').decode('utf-8')
    # tweet = tweet.encode('utf-8')
    tweet = tweet.encode('ascii', 'ignore').decode('ascii')
    return tweet

def getHTMLSoupFromCityAndHashtags(hashtags, city):
    twitterURL = 'https://twitter.com/search?vertical=default&q='+hashtags+'%20near%3A%22'+city+'%22%20within%3A'+DISTANCE_TO_SEARCH_IN_MILES+'mi'
    requestHTML = requests.get(twitterURL)
    soup = BeautifulSoup(requestHTML.text, 'html.parser')
    return soup

class TweetData():
    def __init__(self, tweet, url, replyCount, retweetCount, likeCount, timestamp):
        self.tweet = tweet
        self.url = url
        self.replyCount = replyCount if replyCount != '' else '0'
        self.retweetCount = retweetCount if retweetCount != '' else '0'
        self.likeCount = likeCount if likeCount != '' else '0'
        self.timestamp = str(timestamp)

    def __str__(self):
        return self.timestamp+'\n'+self.tweet+'\n'+self.url+'\n'+'Reply count: '+self.replyCount+'\n'+'Retweet count: '+self.retweetCount+'\n'+'Like count: '+self.likeCount

def getTweetDataFromSoup(soup):
    tweetData = []
    for div in soup.findAll('div', class_='content'):
        tweet = cleanUpRawTweets(div.find('p', class_='tweet-text').text)
        url = div.find('div', class_='AdaptiveMedia-photoContainer')
        url = url.find('img')['src'] if url != None else 'No url'
        timestamp = datetime.fromtimestamp(int(div.find('span', class_='_timestamp')['data-time']))
        replyCount = div.find('div', class_='ProfileTweet-action--reply').find('div', class_='IconTextContainer').find('span', class_='ProfileTweet-actionCountForPresentation').text
        retweetCount = div.find('div', class_='ProfileTweet-action--retweet').find('div', class_='IconTextContainer').find('span', class_='ProfileTweet-actionCountForPresentation').text
        likeCount = div.find('div', class_='ProfileTweet-action--favorite').find('div', class_='IconTextContainer').find('span', class_='ProfileTweet-actionCountForPresentation').text
        tweetData.append(TweetData(tweet, url, replyCount, retweetCount, likeCount, timestamp))
    return tweetData

def updateTweetsInDatabase(hashtags):
    conn = psycopg2.connect(database='bank', user='root', host='nwmeme.westus.cloudapp.azure.com', port=26257)
    conn.set_session(autocommit=True)
    databaseCursor = conn.cursor()
    databaseCursor.execute('SELECT cityName FROM nwmeme.cities')
    citiesDB = databaseCursor.fetchall()
    cities = []
    for city in citiesDB:
        cities.append([str(cell) for cell in city][0])

    hashtagsToQuery = hashtagListToURLstringQuery(hashtags)
    for city in cities:
        soup = getHTMLSoupFromCityAndHashtags(hashtagsToQuery, city)
        tweetData = getTweetDataFromSoup(soup)
        print('------'+city+'------')
        for tweet in tweetData:
            print(tweet)
            databaseCursor.execute("INSERT INTO nwmeme.tweets (cityId, tweet, imageUrl, retweetCount, likesCount, repliesCount, tweetedTime) SELECT city.cityId, '"+tweet.tweet+"', '"+tweet.url+"', "+tweet.retweetCount+", "+tweet.likeCount+", "+tweet.replyCount+", '"+tweet.timestamp+"' FROM nwmeme.cities city WHERE cityName = '"+city+"'")

    databaseCursor.close()
    conn.close()

def updateMemeDatabase():
    pass

updateTweetsInDatabase(HASHTAGS_TO_SEARCH)
