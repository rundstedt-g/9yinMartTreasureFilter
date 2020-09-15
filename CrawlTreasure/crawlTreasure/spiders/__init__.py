# 这个包将包含您的Scrapy项目的爬虫
#
# 有关如何创建和管理的信息，请参阅文档
# 您的爬虫

import json
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
            print(newUrl)
            yield scrapy.Request(newUrl, callback=self.parse_content, meta=response.meta)

    def parse_content(self, response):
        sites = json.loads(response.body_as_unicode())
        for i in sites[0]['pageData']:
            tree = etree.HTML(i['itemDesc'])
            treasureProp = tree.xpath('//font[@color="#FFD700"]')
            a = []
            a.clear()
            for k in treasureProp:
                a.append(k.text)

            num = 0
            for j in a:
                if j.find('气血恢复速率')>=0 or j.find('暴击伤害减免')>=0 or j.find('被暴击几率降低')>=0 :
                    num += 1

            if num == 3 :
                item = CrawltreasureItem()
                item['status'] = response.meta['status']
                item['name'] = i['itemName']
                item['id'] = i['id']
                item['price'] = i['price']
                item['itemDesc'] = a
                yield item



