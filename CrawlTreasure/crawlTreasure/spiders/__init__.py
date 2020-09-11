# 这个包将包含您的Scrapy项目的爬虫
#
# 有关如何创建和管理的信息，请参阅文档
# 您的爬虫

import json
import scrapy
import time

from crawlTreasure.items import CrawltreasureItem

class CrawltreasureSpider(scrapy.Spider):
    name = 'crawlTreasure'
    url = 'http://jishi.woniu.com/9yin/anonymous/findSellingGoods.do?serverId=186100101&gameId=10&typeNameParam=146'
    time_stamp = str(int(time.time()*1000))
    allowed_domains = ['woniu.com']
    start_urls = [url+'&_='+time_stamp]

    def _parse(self, response):
        sites = json.loads(response.body_as_unicode())
        totalPages = sites[0]['pageInfo']['totalPages']
        for i in range(1,totalPages+1):
            new_time_stamp = str(int(time.time()*1000))
            newUrl = self.url + '&pageIndex=' +str(i) +'&_=' + new_time_stamp
            yield scrapy.Request(newUrl, callback=self.parse_content)

    def parse_content(self, response):
        sites = json.loads(response.body_as_unicode())
        for i in sites[0]['pageData']:
            item = CrawltreasureItem();
            item['name'] = i['itemName']
            item['id'] = i['id']
            item['price'] = i['price']
            item['itemDesc'] = i['itemDesc']
            yield item

