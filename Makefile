sqlite:
	rm -f database.db;touch database.db;node --max-old-space-size=12048 import-data.js
start:
	rm -R -f data;mkdir data;touch data/visitedURL.json;touch data/temp_crawling_status.csv; touch data/content.csv;touch data/temp_founded.csv;touch data/out_link.csv; node --max-old-space-size=18096 index.js first
