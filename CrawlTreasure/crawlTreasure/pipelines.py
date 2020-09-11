# 在这里定义项目管道
#
# 不要忘记将您的管道添加到项目管道设置中
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface

import json

from itemadapter import ItemAdapter



class CrawltreasurePipeline:
    def __init__(self):
            self.file = open('treasure.json', mode='w', encoding='utf-8')
    def process_item(self, item, spider):
        jsondata = json.dumps(dict(item), ensure_ascii=False) + "\n"
        self.file.write(jsondata)
        return item
    def close_spider(self, spider):
        self.file.close()
