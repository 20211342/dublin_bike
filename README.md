# dublinBike
This is a Group Project for Course COMP 30830.  
Team Member:  
XinHui Jiang  
Bo Tian  
Cheng Zhang  

# Project Overview
## Introduction
This project is a web application about public bicycles system in Dublin. The application is designed to allow users to efficiently and quickly view various information about Dublin Bikes through the application, which includes information about bike occupancy in Dublin, station information as well as weather information and future weather information. Users can also navigate to the best route to the station they want to go to by their current location or by the location they have entered. The app makes it easy for users to register, check station information and rent and return bikes, as well as check the weather information for Dublin and even future weather information.

## The Objectives of this app
The objective of our project is to let users know how many bike stations are in Dublin and how many available bikes in these stations, so they can know if using a bike rental service is worth it for them. If there are enough stations in Dublin, they can easily get out with these bikes. Besides, best routes are also calculated given the users’ current location so that the users don’t need to take extra efforts on finding the most appropriate stations. It’s the same when the user wants to return the bike whenever they want. They can find where is the most suitable station to rent the bikes.

## Target
The intended target clients for this application is people of all ages who want to use the public bikes rental system. With this app, they can go out with the help of public bikes, which will make their lives easier and more convenient. For this reason, the app is also designed to be easy to use to make sure that for any kinds of users there is no difficulty to operate on it.

## What does the app do
The app is designed to allow users to check station information as well as check weather information in Dublin. Then the users can know where to find available public bikes and where to return already rented bikes. Besides, future weather information and bike stands information are also provided so that a user can make his / her travel plan in advance. The app also allows users to know the best route to the nearest station which will meet their demands according to either their current location or the location they have entered.

## Structure
First is the login page of the app. When we click on the URL to access the webpage, we will see the login page. We can enter our username and password to try to access the app. Once the username and password are correct, we can enter our navigation page by clicking the login button.
When entering the navigation page, we can see that the page is divided into three parts. Part 1 is the navigation part, which we can type the starting point and destination to find the optimum station. Part 2 is the map part, which displays the stations in Dublin and we can access the current information when we click on a specific station. Part 3 is the weather part. Current weather information such as feels like temperature, wind degree is all displayed in this part. In the following part we will introduce these parts in detail separately.
#### 1. Navigation part
The Navigation section has the following functions:
By filling in the start point, we can see the location. And during typing, hints will be given according to current input. By selecting one of these hints, we can get the coordinates of the starting location and display the marker on the map. The process of setting the destination is similar. Then, by selecting travel mode, you can view the routes using different travel modes between these two locations.
When we find a bicycle, we can easily check the route to our destination by adjusting the travel mode to Bicycling. The "use my current position" button can get the user's current address and automatically fill in the starting point address.
There are two buttons below the “end” search box, the first one can show the route from the current location to the nearest bike station with free vehicles. The second button shows the route from your current location to the nearest bike station with free stands. This will help us find the right station, because we don't have to open the information window of each station's marker one by one.
#### 2. Map part
All stations will be displayed by default . Each marker represents a public bike station in Dublin. And the map can accordingly change if we operate on the navigation part. If permitted to access the users’ locations, a flag marker will be displayed in the map . If we click on a specific marker, more detailed information such as available bike stands, available bikes in this station will be displayed.
#### 3. Weather
Displays the layout of the weather part. We can see that all weather information is displayed in this part. Users can easily know the weather condition from this part.

## Features
In general, we want to make it easier for users to use Dublin Bike's services with the help of our app. And features are designed based on this.

First of all, we want the user to see a brief interface in order to make the app easy to use. All locations of Dublin Bike stations can be seen on this interface. Users can get station information by simply interacting with the station markers on the map.

Second, we hope that users can directly obtain the location of the nearest station which can borrow or return the public bikes according to their current location. The route should also be displayed on the map. Besides, the user can change the starting point and the destination to see which is the most appropriate station. In this way, the user can basically know the public bikes system situation in Dublin and can have a better travel experience. 

Third, considering that riding bicycles depends more on the weather compared to other forms of transportation, the number of available bikes should be related to it. Thus, we think weather information should also be provided. In that way, people can in advance decide whether to use shared bicycles for travel with the weather forecast. We also want to display corresponding available bike stans with the predicted weather information.
