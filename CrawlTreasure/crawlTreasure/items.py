# 在这里定义您的爬取项目的模型
#
# 参阅文档:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class CrawltreasureItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    id = scrapy.Field()
    itemName = scrapy.Field()
    price = scrapy.Field()
    itemAmount = scrapy.Field()
    statu = scrapy.Field()
    publicityEndDate = scrapy.Field()
    shelfDate = scrapy.Field()
    shelfDays = scrapy.Field()
    property = scrapy.Field()
    skill = scrapy.Field()
    followCount = scrapy.Field()
    iconPath = scrapy.Field()
    itemDesc = scrapy.Field()
    serverId = scrapy.Field()