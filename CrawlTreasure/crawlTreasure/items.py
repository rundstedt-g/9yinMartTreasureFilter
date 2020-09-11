# 在这里定义您的爬取项目的模型
#
# 参阅文档:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class CrawltreasureItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    name = scrapy.Field()
    id = scrapy.Field()
    price = scrapy.Field()
    itemDesc =scrapy.Field()
