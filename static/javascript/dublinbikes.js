function initMap()
{
    var directionsService=new google.maps.DirectionsService();
    var directionsRenderer=new google.maps.DirectionsRenderer();

//地图打开时的中心区域
    var DublinArea=
    {
        zoom:14,
        center:{ lat:53.349722, lng:-6.260278 },
    };

    var map=new google.maps.Map(document.getElementById('map'),DublinArea);
    directionsRenderer.setMap(map);
    //定位当前位置，增加marker，获取坐标
    const geocoder = new google.maps.Geocoder();

//这里现在是当前位置的坐标
    var my_position={};
//这里现在是当前位置的坐标

//这里开始获取当前位置的具体操作
    var my_position_str="";
    function GetMyPosition(geocoder)
    {
        if(navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition
            (
                function(position)
                {
                    my_position=
                    {
                        lat:position.coords.latitude,
                        lng:position.coords.longitude
                    };
                    console.log("my_position",my_position);
                    new google.maps.Marker
                    (
                        {
                            position:my_position,
                            title:"My Position",
                            map:map,
                            icon:"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
                        }
                    );
                    map.setCenter(my_position);
                    console.log("my_position",my_position);
                    geocoder
                            .geocode({location:my_position})
                            .then((response)=>{
                                if(response.results[0]){
                                    my_position_str=response.results[0].formatted_address;
                                }
                                    else
                                    {
                                        window.alert("no results found");
                                    }


                                }
                                
                            )
                            
                            .catch((e)=>window.alert("geocoder failed due to:"+e));
                }
            );

        }
    }//获取具体当前位置的操作结束

    //用myposition填充起点的内容
    document.getElementById("current").addEventListener("click",GetMyPosition(geocoder));
    // console.log("my_position",my_position);
    function change_start()
    {
        document.getElementById("start_input").value=my_position_str;
    }
    document.getElementById("current").addEventListener("click",change_start);
    // console.log("my_position",my_position);
    // console.log("my_position_str",my_position_str);

//给都柏林中心一个marker
    var marker_DublinCenter = new google.maps.Marker
    (
        {
            position:{ lat:53.349722, lng:-6.260278 },
            map,
            title:"Hello Dublin"
        }
    );

//都柏林中心marker点击事件
    var infowindow = new google.maps.InfoWindow
    (
        {
            content:'<h2 id="test">Hello Dublin</h2>'
        }
    );  
    marker_DublinCenter.addListener
    (
        "click",
        function ()
        {
            infowindow.open(map,marker_DublinCenter);
        }
    );

//定义一个增加marker的函数用以添加所有车站的marker
    function addMarker(props)
    {
        var marker_station = new google.maps.Marker
        (
            {
                position:{ lat:props.lat,lng:props.lng},
                map,

            }
        );
        return marker_station;
    }

//定义一个点击station marker 的 info 窗口信息函数
    function addInfowindow(station_infomation,marker_station)
    {
        var infowindow = new google.maps.InfoWindow
        (
            {
                content:station_infomation
            }
        );
        marker_station.addListener('click',function(){
            infowindow.open(map,marker_station);
        });
    }

//获取站点动态json数据。
//可用车辆，可用车庄，具体时间信息这三样用于展示在station maker 的 infowindow里

//另外这里获取了，所有可用车辆非零的车站集合origin_station_set，所有可用车庄非零的车站集合destination_station_set
//由于上面两个变量的作用于仅限于这个getJSON中，所以还要在这里进行画图等操作。
    $.getJSON
    (
        $SCRIPT_ROOT + "/occupancy",
        function(data)
        {
            var occupancy=data.occupancy;
            console.log("occupancy",occupancy);
//这个数组用以储存所有车站的位置信息
            var station_position = new Array();
//这个变量用以储存所有，可用车辆不为0的车站位置信息
            var origin_station_set = new Array();
//这个变量用以储存所有，可用车庄不为0的车站位置信息
            var destination_station_set = new Array();

            for(var i=0;i<110;i++)
            {
                //这里的临时变量是关于坐标信息，用以给每个车站添加一个marker
                var temp_stations_infomation = new Object();
                temp_stations_infomation.lat=occupancy[i].latitude;
                temp_stations_infomation.lng=occupancy[i].longitude;
                station_position.push(temp_stations_infomation);
                addMarker(station_position[i]);
               

                //这里的临时变量是关于选择可用车站的信息，后面在这里面挑选可用的车站作为起始车站和还车车站
                var temp_choose_station = new Object();
                temp_choose_station.bike=occupancy[i].avaiable_bikes;
                temp_choose_station.sta=occupancy[i].avaiable_bike_stands;
                temp_choose_station.lat=occupancy[i].latitude;
                temp_choose_station.lng=occupancy[i].longitude;
                
                //对temp_choose_station进行选择
                if(temp_choose_station.bike !=0)
                {
                    origin_station_set.push(temp_choose_station);
                }
                if(temp_choose_station.sta !=0)
                {
                    destination_station_set.push(temp_choose_station);
                }

//这里开始获取时间信息,可用车信息，可用车庄信息，化为字符串 放进每个marker的infowindow里
                var contentString='';
                var date = new Date(occupancy[i].last_update*1000);
                var Y=date.getFullYear() + '-';
                var M=(date.getMonth() + 1<10?'0'+(date.getMonth()+1):date.getMonth()+1 ) + '-';
                var D=date.getDate() + '';
                var h=date.getHours() + ':';
                var m=date.getMinutes() + ':';
                var s=date.getSeconds() ;
                //这是时间字符串信息
                var dateInfo=Y+M+D+h+m+s;

                //这是可用车信息和可用车庄信息
                var avaiable_bikes_str=String(occupancy[i].avaiable_bikes);
                var avaiable_bike_stands_str=String(occupancy[i].avaiable_bike_stands);

                contentString+=
                '<h2>' + occupancy[i].stationName + '</h2>' +
                '<ul>' +
                '<li>' + 'avaiable bikes' + avaiable_bikes_str + '</li>' +
                '<li>' + 'avaiable bike stands' + avaiable_bike_stands_str + '</li>' +
                '<li>' + dateInfo + '</li>' +
                '</ul>';


                addInfowindow(contentString,addMarker(station_position[i]));
            }//for 循环结束
            
            

            new AutocompleteDirectionsHandler(map);

//通过每次地点不同的计算，得出最合适的自行车出发点和还车点坐标。
            var minimize_distance_start=1000000;
            var minimize_distance_end=1000000;
            var pointer_1=-1;
            var pointer_2=-1;

            //计算距离函数
            function haversine_distance(mk1, mk2) {
                var R = 3958.8; // Radius of the Earth in miles
                var rlat1 = mk1.lat * (Math.PI/180); // Convert degrees to radians
                var rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
                var difflat = rlat2-rlat1; // Radian difference (latitudes)
                var difflon = (mk2.lng-mk1.lng) * (Math.PI/180); // Radian difference (longitudes)        
                var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
                return d;
              }


            for(var j=0;j<origin_station_set.length;j++)
            {
                var des_temp = { lat : origin_station_set[j].lat , lng : origin_station_set[j].lng };
                var distance_distance=haversine_distance(my_position,des_temp);
                var distance_temp=distance_distance;

               if (distance_temp<minimize_distance_start)
               {
                   minimize_distance_start=distance_temp;
                   pointer_1=j;
               }
            }
            
            origin_station={lat:origin_station_set[pointer_1].lat,lng:origin_station_set[pointer_1].lng};

            for(var k=0;k<destination_station_set.length;k++)
            {
                var des_temp = { lat : destination_station_set[k].lat , lng : destination_station_set[k].lng };
                var distance_return=haversine_distance(my_position,des_temp);
                var distance_return_temp=distance_return;

               if (distance_return_temp<minimize_distance_end)
               {
                   minimize_distance_end=distance_return_temp;
                   pointer_2=k;
               }
            }

            destination_station={lat:destination_station_set[pointer_2].lat,lng:destination_station_set[pointer_2].lng};



            document.getElementById("find_origin_station").addEventListener("click",route_me_to_nearest_station);

            function route_me_to_nearest_station(){
                directionsService
                .route({
                    origin:my_position,
                    destination:origin_station,
                    travelMode:"WALKING"
                })
                .then((response)=>{directionsRenderer.setDirections(response)});
                ;
            }
            console.log("origin_station",origin_station);

            document.getElementById("return_bike").addEventListener("click",route_me_to_nearest_station_return);

            function route_me_to_nearest_station_return(){
                directionsService
                .route({
                    origin:my_position,
                    destination:destination_station,
                    travelMode:"WALKING"
                })
                .then((response)=>{directionsRenderer.setDirections(response)});
                ;
            }

            console.log("detination_station",destination_station);


        }//function（data）结束


    );// 获取车站信息的get json结束
    
    
//这里开始获取天气信息
//定义一个函数，用以填充前端html天气位置的信息
function initWeather(weather){
    document.getElementById("fellslike").innerHTML=" "+weather[0].feelslikeTemp;
    document.getElementById("humidity").innerHTML=" "+weather[0].humidity;
    document.getElementById("WindDegree").innerHTML=" "+weather[0].windDegree;
    document.getElementById("WindSpeed").innerHTML=" "+weather[0].windSpeed;
    document.getElementById("temperature").innerHTML=" "+weather[0].temperature;
    document.getElementById("weathertype").innerHTML=" "+weather[0].weather;
  
     }

//获取天气的json信息
$.getJSON
(
    $SCRIPT_ROOT + "/weather",
    function(data)
    {
        weather=data.weather;
        console.log("weather",weather);
        initWeather(weather);

    }
);//获取天气json并展现在前端结束

$.getJSON
(
    $SCRIPT_ROOT + "/predictInfo",
    function(data)
    {
        predictInfo=data.predictInfo;
        console.log("predictInfo",predictInfo);
        initWeather(weather);

    }
);




}//initmap函数的结束
class AutocompleteDirectionsHandler {
    map;
    originPlaceId;
    destinationPlaceId;
    travelMode;
    directionsService;
    directionsRenderer;
    constructor(map) {
      this.map = map;
      this.originPlaceId = "";
      this.destinationPlaceId = "";
      this.travelMode = google.maps.TravelMode.WALKING;
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(map);
  
      const originInput = document.getElementById("start_input");
      const destinationInput = document.getElementById("end_input");
      const modeSelector = document.getElementById("mode-selector");
      // Specify just the place data fields that you need.
      const originAutocomplete = new google.maps.places.Autocomplete(
        originInput,
      );
      // Specify just the place data fields that you need.
      const destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput,
      );
  
      this.setupClickListener(
        "changemode-walking",
        google.maps.TravelMode.WALKING
      );
      this.setupClickListener(
        "changemode-transit",
        google.maps.TravelMode.TRANSIT
      );
      this.setupClickListener(
        "changemode-driving",
        google.maps.TravelMode.DRIVING
      );
      this.setupClickListener(
        "changemode-bicycling",
        google.maps.TravelMode.BICYCLING
      );

      this.setupPlaceChangedListener(originAutocomplete, "ORIG");
      this.setupPlaceChangedListener(destinationAutocomplete, "DEST");
    }
    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
    setupClickListener(id, mode) {
      const radioButton = document.getElementById(id);
  
      radioButton.addEventListener("click", () => {
        this.travelMode = mode;
        this.route();
      });
    }
    setupPlaceChangedListener(autocomplete, mode) {
      autocomplete.bindTo("bounds", this.map);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
  
        if (!place.place_id) {
          window.alert("Please select an option from the dropdown list.");
          return;
        }
  
        if (mode === "ORIG") {
          this.originPlaceId = place.place_id;
        } else {
          this.destinationPlaceId = place.place_id;
        }
  
        this.route();
      });
    }
    route() {
      if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
      }
  
      const me = this;
  
      this.directionsService.route(
        {
          origin: { placeId: this.originPlaceId },
          destination: { placeId: this.destinationPlaceId },
          travelMode: this.travelMode,
        },
        (response, status) => {
          if (status === "OK") {
            me.directionsRenderer.setDirections(response);
          } else {
            window.alert("Directions request failed due to " + status);
          }
        }
      );
    }
    
  }
