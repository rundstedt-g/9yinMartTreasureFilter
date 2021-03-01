#!/usr/bin/python
import sys
import os
curPath = os.path.abspath(os.path.dirname(__file__))
rootPath = os.path.split(curPath)[0]
sys.path.append(rootPath)
from scrapy import cmdline
cmdline.execute("scrapy crawl crawlTreasure -a serverId=186100101".split())