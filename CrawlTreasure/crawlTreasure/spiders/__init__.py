# 这个包将包含您的Scrapy项目的爬虫
#
# 有关如何创建和管理的信息，请参阅文档
# 您的爬虫

import json

import pymysql
import scrapy
import time
from lxml import etree

from crawlTreasure.items import CrawltreasureItem


class CrawltreasureSpider(scrapy.Spider):
    name = 'crawlTreasure'
    allowed_domains = ['woniu.com']

    def __init__(self,serverId=None,*args, **kwargs):
        super(CrawltreasureSpider,self).__init__(*args, **kwargs)
        self.serverId=serverId

    def start_requests(self):
        status =['Selling', 'Notice']
        for i in status:
            self.url = 'http://jishi.woniu.com/9yin/anonymous/find'+i+'Goods.do?serverId='+self.serverId+'&gameId=10&typeNameParam=146'
            print('URL :'+self.url)
            time_stamp = str(int(time.time()*1000))
            startUrl = self.url+'&_='+time_stamp
            yield scrapy.Request(startUrl, callback=self._parse, meta={'status': i})

    def _parse(self, response):
        sites = json.loads(response.body_as_unicode())
        totalPages = sites[0]['pageInfo']['totalPages']
        print('总页数')
        print(totalPages)
        for i in range(1,totalPages+1):
            new_time_stamp = str(int(time.time()*1000))
            newUrl = 'http://jishi.woniu.com/9yin/anonymous/find'+response.meta['status']+'Goods.do?serverId='+self.serverId+'&gameId=10&typeNameParam=146' + '&pageIndex=' +str(i) +'&_=' + new_time_stamp
            yield scrapy.Request(newUrl, callback=self.parse_content)

    def parse_content(self, response):
        sites = json.loads(response.body_as_unicode())
        for i in sites[0]['pageData']:
            tree = etree.HTML(i['itemDesc'])
            treasureProp = tree.xpath('//font[@color="#FFD700"]')
            treasureSkill = tree.xpath('//font[@color1="#FF0000"]')
            if len(treasureSkill)==0:
                skillText = ""
            else:
                skillText = treasureSkill[0].text
            itemProp = []
            itemProp.clear()
            for k in treasureProp:
                itemProp.append(k.text)
            propChar = ','.join(itemProp)
            itemMeta = {
                'id' : i['id'],
                'itemName' : i['itemName'],
                'price' : i['price'],
                'itemAmount' : i['itemAmount'],
                'statu' : i['status'],
                'publicityEndDate' : i['publicityEndDate'],
                'shelfDate' : i['shelfDate'],
                'shelfDays' : i['shelfDays'],
                'property' : propChar,
                'skill' : skillText,
                'iconPath' : i['iconPath'],
                'itemDesc' : i['itemDesc'],
                'serverId' : i['serverId']
            }
            fUrl = 'http://jishi.woniu.com/9yin/anonymous/getItemsFollowCount.do?serverId='
            serverId = i['serverId']
            itemIds = i['id']
            time_stamp = str(int(time.time()*1000))
            followUrl = fUrl+serverId+'&gameId=10&itemIds='+str(itemIds)+'&_='+time_stamp
            yield scrapy.Request(followUrl, callback=self.parse_follow, meta=itemMeta)

    def parse_follow(self, response):
        sites = json.loads(response.body_as_unicode())
        id = response.meta['id']
        followCount = sites[0]['data'][str(id)]
        item = CrawltreasureItem()
        item['id'] = response.meta['id']
        item['itemName'] = response.meta['itemName']
        item['price'] = response.meta['price']
        item['itemAmount'] = response.meta['itemAmount']
        item['statu'] = response.meta['statu']
        item['publicityEndDate'] = response.meta['publicityEndDate']
        item['shelfDate'] = response.meta['shelfDate']
        item['shelfDays'] = response.meta['shelfDays']
        item['property'] = response.meta['property']
        item['skill'] = response.meta['skill']
        item['followCount'] = followCount
        item['iconPath'] = response.meta['iconPath']
        item['itemDesc'] = response.meta['itemDesc']
        item['serverId'] = response.meta['serverId']
        yield item


