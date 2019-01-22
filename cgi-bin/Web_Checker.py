import requests
from bs4 import BeautifulSoup
import time
import smtplib


url = 'https://ntst.umd.edu/soc/search?courseId=CHEM241&sectionId=&termId=201801&_openSectionsOnly=on&creditCompare=&credits=&courseLevelFilter=ALL&instructor=&_facetoface=on&_blended=on&_online=on&courseStartCompare=&courseStartHour=&courseStartMin=&courseStartAM=&courseEndHour=&courseEndMin=&courseEndAM=&teachingCenter=ALL&_classDay1=on&_classDay2=on&_classDay3=on&_classDay4=on&_classDay5=on'
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}


response = requests.get(url, headers=headers)

soup = BeautifulSoup(response.text, 'lxml')
print(type(soup))
sections = soup.find_all('span', class_='open-seats-count')
section_numbers = soup.find_all('span', class_='section-id')
section_numbers = section_numbers[:6]
stocker_sections = sections[:6]
i = 0
for s in stocker_sections:
	if int(s.text) == 0 and int(section_numbers[i].text.strip()) != 6127:
		print('No Seats Open in section ' + section_numbers[i].text.strip())

	i += 1

	