sqlite:
	rm -f data-my.db;touch data-my.db;node --max-old-space-size=12096 index.js
start:
	rm -R -f data;mkdir data;touch data/visitedURL.json;touch data/temp_crawling_status.csv; touch data/content.csv;touch data/temp_founded.csv;touch data/out_link.csv; node --max-old-space-size=18096 index1.js
