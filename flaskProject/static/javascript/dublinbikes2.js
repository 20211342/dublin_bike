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
                // if(temp_choose_station.sta !=0)
                // {
                //     destination_station_set.push(temp_choose_station);
                // }



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
            //检测以下 获取的数据

             //接下来要开始画图了，目前所具备的条件有：
                //（1）始发车站，还车车站的集合
                //（2）当前位置的坐标

                //还需要的有
                //（1）解析start 以及 end 搜索框的内容，自动匹配类似地址，点击获取地址坐标或者placeid
                //（2）画图，共三条路线：
                //        一、由start 或者 当前位置 出发,到origin_station（从始发车站集合中选择）的路线，
                //           origin_station从 origin_station_set 中选择,这说明这一步还需要：
                //                 选择出origin_station_set中距离 start 最近的那一个 origin_station;
                //                 画出start 到 这个特别的 origin_station 的路线
                //        二、由destination_station 出发到目的地的路线，destination_station从destination_station_set选择，
                //           说明这一步还需要：
                //                 从destination_station_set中选择出距离 end 最近的 destination_station；
                //                 画出这个特别的 destination_station到end 的路线 


                //解析start与end
               



            // console.log("mypositon",my_position);
            // console.log("origin_station_set",origin_station_set);
            // console.log("destination_station_set",destination_station_set);
            // console.log("station_position",station_position);


            document.getElementById("current").addEventListener("click",change_start);


            new AutocompleteDirectionsHandler(map);




      
              
              

              
              





















//             var start_input=document.getElementById("start_input");
//             var end_input=document.getElementById("end_input");
// //初始和终点的marker
//             var start_marker = new google.maps.Marker({
//                 map,
//             });
//             var end_marker = new google.maps.Marker({
//                 map,
//             });


            //定义一个自动完成函数
            // var start_autocomplete = new google.maps.places.Autocomplete(start_input);
            // var end_autocomplete = new google.maps.places.Autocomplete(end_input);
            // var start_position=my_position;
            // var end_position={ lat:53.349722, lng:-6.260278 };
            // setupPlaceChangedListener(start_autocomplete,"ORIG",start_position);
            // setupPlaceChangedListener(end_autocomplete,"DEST",end_position);

            // function setupPlaceChangedListener(autocomplete,mode,posi)
            // {
            //     autocomplete.addListener("place_changed",()=>{
            //         var place=autocomplete.getPlace();
            //         if(mode==="ORIG")
            //         {
            //             posi=place.geometry.location;
            //             start_marker.setPosition(place.geometry.location);//返回的是latlng（x，y）    
            //         }
            //         else if(mode==="DEST")
            //         {
            //             posi=place.geometry.location;
            //             end_marker.setPosition(place.geometry.location);
            //         }
            //     });

            // }
            // console.log("startposition",start_position);
            

//通过每次地点不同的计算，得出最合适的自行车出发点和还车点坐标。
            var minimize_distance_start=1000000;
            // var minimize_distance_end=1000000;
            var pointer_1=-1;
            // var pointer_2=-1;
            var travelmode1;
            var travelmode2="BICYCLING";
            // var travelmode3;

            function setupClickListener(id,tmode)
            {
                const radioButton = document.getElementById(id);
                if(id==="changemode-walking")
                {
                    radioButton.addEventListener("click",()=>{
                        tmode="WALKING";
                    });
                }
                else if(id==="changemode-transit")
                {
                    radioButton.addEventListener("click",()=>{
                        tmode="TRANSIT";
                    });
                }
                else if(id==="changemode-driving")
                {
                    radioButton.addEventListener("click",()=>{
                        tmode="DRIVING";
                    });
                }
                else if(id==="changemode-bicycling")
                {
                    radioButton.addEventListener("click",()=>{
                        tmode="BICYCLING";
                    });
                }
                // else if(id==="changemode-transit_2")
                // {
                //     radioButton.addEventListener("click",()=>{
                //         tmode="TRANSIT";
                //     });
                // }
                // else if(id==="changemode-driving_2")
                // {
                //     radioButton.addEventListener("click",()=>{
                //         tmode="DRIVING";
                //     });
                // }

            }
            setupClickListener("changemode-walking",travelmode1);
            setupClickListener("changemode-transit",travelmode1);
            setupClickListener("changemode-driving",travelmode1);
            // setupClickListener("changemode-walking_2",travelmode3);
            // setupClickListener("changemode-transit_2",travelmode3);
            // setupClickListener("changemode-driving_2",travelmode3);

            //计算距离函数
            var distanceMatrixService = new google.maps.DistanceMatrixService();
            var distance_request={};

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
                var distance_distance=haversine_distance(start_position,des_temp);
                

               var distance_temp=distance_distance;

               if (distance_temp<minimize_distance_start)
               {
                   minimize_distance_start=distance_temp;
                   pointer_1=j;
               }
            }
            
            origin_station={lat:origin_station_set[pointer_1].lat,lng:origin_station_set[pointer_1].lng};
            // console.log("origin_station",origin_station);

            // for(var k=0;k<destination_station_set.length;k++)
            // {
            //     var des_temp = { lat : destination_station_set[k].lat , lng :destination_station_set[k].lng };
            //     var distance_distance=haversine_distance(end_position,des_temp);

            //     var distance_temp=distance_distance;

            //    if (distance_temp<minimize_distance_end)
            //    {
            //        minimize_distance_end=distance_temp;
            //        pointer_2=j;
            //    }
            // }
            // destination_station={lat:destination_station_set[pointer_2].lat,lng:destination_station_set[pointer_2].lng};






            //
            


            //origin_station与destination_station的计算与获取




            //


            //用于画图的route变量的集合，这里说明还缺几个变量分别是：
            //(1)start_position
            //(2)destination_position
            //(3)travelmode1
            //(4)travelmode2=BICYCLING
            //(5)travelmode3

            // var route_1=
            // {
            //     orgin:start_position,
            //     destination:origin_station,
            //     travelMode:"WALKING"

            // };
            // var route_2=
            // {
            //     orgin:origin_station,
            //     destination:destination_station,
            //     travelMode:"BICYCLING"

            // };
            // var route_3=
            // {
            //     orgin:destination_station,
            //     destination:end_position,
            //     travelMode:"WALKING"
            // };

            // console.log("start_position",start_position);
            // console.log("origin_station",origin_station);
            // console.log("destination_station",destination_station);
            // console.log("end_position",end_position);
            // console.log("travelmode1",travelmode1);

            directionsService
            .route({
                origin:my_position,
                destination:origin_station,
                travelMode:"WALKING"
            })
            .then((response)=>{directionsRenderer.setDirections(response)});
            ;
            // directionsService2=new google.maps.DirectionsService();
            // directionsService2
            // .route({
            //     orgin:origin_station,
            //     destination:destination_station,
            //     travelMode:"BICYCLING"
            // })
            // .then((response)=>{directionsRenderer.setDirections(response)});
            // ;



            // var routes=
            // [
            //     //start 到 始发车站的路线
            //     {
            //         orgin:start_position,
            //         destination:origin_station,
            //         travelMode:travelmode1
            //     },

            //     {
            //         orgin:origin_station,
            //         destination:destination_station,
            //         travelMode:travelmode2
            //     },

            //     {
            //         orgin:destination_station,
            //         destination:end_position,
            //         travelMode:travelmode3
            //     }

            // ];

            //对route集合中的每个route进行画图
            // routes.forEach
            // (
            //     function(route)
            //     {
            //         new google.maps.DirectionsService().route
            //         (
            //            route,function(body)
            //            {
            //               var display = new google.maps.DirectionsRenderer();

            //               display.setMap(map);
            //               display.setDirections(body);
            //            }
            //         );

            //     }
            // );//forEach的结尾


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
