# 在这里定义项目管道
#
# 不要忘记将您的管道添加到项目管道设置中
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface

import json

import pymysql as pymysql
from itemadapter import ItemAdapter



class CrawltreasurePipeline:
    def __init__(self):
        self.connect=pymysql.connect(host='localhost',user='root',password='Wx6874024',db='treasure')
        self.cursor=self.connect.cursor()
    def process_item(self, item, spider):
        sqlStatement = "insert into treasure."+item['serverId']+"(id,itemName,price,itemAmount,statu,publicityEndDate,shelfDate,shelfDays,property,skill,followCount,iconPath,itemDesc)VALUES ({},'{}',{},{},'{}','{}','{}',{},'{}','{}',{},'{}','{}')"
        self.cursor.execute(sqlStatement.format(item['id'],item['itemName'],item['price'],item['itemAmount'],item['statu'],item['publicityEndDate'],item['shelfDate'],item['shelfDays'],item['property'],item['skill'],item['followCount'],item['iconPath'],item['itemDesc']))
        self.connect.commit()#执行添加
        return item
    def close_spider(self, spider):
        self.cursor.close()
        self.connect.close()  #关闭连接
