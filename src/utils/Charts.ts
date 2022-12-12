export default class Charts {
  private static days = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

  public static windChart: any = {
    chart: {
      // type of diagram
      type: 'spline',
      marginLeft: 2,
      marginRight: 2,
      marginTop: 2,
      marginBottom: 23,
      height: 0,
      width: 0
    },
    plotOptions: {
      spline: {
        stacking: 'normal',
        dataLabels: {
          color: 'black',
          format: '{y} m/s',
          enabled: true,
          style: {
            textOutline: 0,
            fontSize: '1rem'
          },
          allowOverlap: true
        }
      },
      series: {
        pointPadding: -0.2
      }
    },
    boost: {enabled: true},
    // bottom right credit
    credits: {
      enabled: false
    },
    // bottom legend for different chart
    legend: {
      enabled: false
    },
    title: {
      text: ''
    },
    series: [
      {
        name: 'Wind',
        data: []
      }
    ],
    xAxis: {
      type: 'category',
      categories: Charts.pastWeekDays(Charts.days, new Date().getDay()),
      labels: {
        rotation: 0
      }
    },
    yAxis: {
      title: {
        text: 'Metre per second (m/s)'
      },
      labels: {
        enabled: false
      }
    },
    tooltip: {
      followPointer: true,
      crosshairs: true,
      shared: true,
      // @ts-ignore
      formatter() {
        // @ts-ignore
        return this.points.reduce(
          (s: any, point: { series: { name: string }; y: any }) => `${s}<br/>${point.series.name}:${point.y}${Charts.metricUnitSetter(point.series.name)}`,
          // @ts-ignore
          `<b>${this.x}</b>`
        );
      }
    }
  };

  public static tempChart: any = {
    chart: {
      // type of diagram
      type: 'column',
      marginLeft: 2,
      marginRight: 2,
      marginTop: 2,
      marginBottom: 23,
      height: 0,
      width: 0
    },
    plotOptions: {
      column: {
        dataLabels: {
          style: {
            textOutline: 0
          },
          formatter(): any {
            // @ts-ignore
            const color = this.y === 0 ? 'black' : 'white';
            // @ts-ignore
            return `<span style="color: ${color}">${this.y}°C</span>`;
          },
          enabled: true
        }
      },
      series: {
        pointPadding: -0.2
      }
    },
    boost: {enabled: true},
    // bottom right credit
    credits: {
      enabled: false
    },
    // bottom legend for different chart
    legend: {
      enabled: false
    },
    title: {
      text: ''
    },
    series: [
      {
        name: 'Temperature',
        data: [],
        animation: {
          duration: 2000,
          easing: Charts.easeOutBounce
        },
        color: null,
        stacking: 'normal',
        dataLabels: {
          color: 'whitesmoke',
          style: {
            fontSize: '1rem',
            fontFamily: 'Trebuchet MS'
          }
        }
      }
    ],
    xAxis: {
      type: 'category',
      categories: Charts.pastWeekDays(Charts.days, new Date().getDay()),
      labels: {
        rotation: 0
      }
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)'
      },
      labels: {
        enabled: false
      }
    },
    tooltip: {
      followPointer: true,
      crosshairs: true,
      shared: true,
      // @ts-ignore
      formatter() {
        // @ts-ignore
        return this.points.reduce(
          (s: any, point: { series: { name: string }; y: any }) => `${s}<br/>${point.series.name}:${point.y}${Charts.metricUnitSetter(point.series.name)}`,
          // @ts-ignore
          `<b>${this.x}</b>`
        );
      }
    }
  };

  public static feelsLikeChart = {
    chart: {
      // type of diagram
      type: 'column',
      marginLeft: 2,
      marginRight: 2,
      marginTop: 2,
      marginBottom: 23,
      height: 0,
      width: 0
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          style: {
            textOutline: 0,
            fontSize: '1rem',
            fontFamily: 'Trebuchet MS'
          },
          // @ts-ignore
          formatter() {
            // @ts-ignore
            const color = this.y === 0 ? 'black' : 'white';
            // @ts-ignore
            return `<span style="color: ${color}">${this.y}°C</span>`;
          },
          enabled: true
        }
      },
      series: {
        pointPadding: -0.2
      }
    },
    boost: {enabled: true},
    // bottom right credit
    credits: {
      enabled: false
    },
    // bottom legend for different chart
    legend: {
      enabled: false
    },
    title: {
      text: ''
    },
    series: [
      {
        name: 'Feels Like',
        data: [],
        animation: {
          duration: 2000,
          easing: Charts.easeOutBounce
        },
        color: null
      }
    ],
    xAxis: {
      type: 'category',
      categories: Charts.pastWeekDays(Charts.days, new Date().getDay()),
      labels: {
        rotation: 0
      }
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)'
      },
      labels: {
        enabled: false
      }
    },
    tooltip: {
      followPointer: true,
      crosshairs: true,
      shared: true,
      // @ts-ignore
      formatter() {
        console.log(this);
        // @ts-ignore
        return this.points.reduce(
          (s: any, point: { series: { name: string }; y: any }) => `${s}<br/>${point.series.name}:${point.y}${Charts.metricUnitSetter(point.series.name)}`,
          // @ts-ignore
          `<b>${this.x}</b>`
        );
      }
    }
  };
  public static hourlyForecast = {
    chart: {
      // type of diagram
      type: 'spline',
      marginLeft: 2,
      marginRight: 2,
      marginTop: 2,
      height: 0,
      width: 0,
      panning: true
    },
    plotOptions: {
      spline: {
        dataLabels: {
          style: {
            textOutline: 0
          },
          enabled: true,
          formatter(): any {
            const color = 'black';
            // @ts-ignore
            return `<span style="color: ${color}">${this.y}°C</span>`;
          },
          shadow: false,
          inside: true
        }
      }
    },
    boost: {enabled: true},
    // bottom right credit
    credits: {
      enabled: false
    },
    // bottom legend for different chart
    legend: {
      enabled: false
    },
    title: {
      text: ''
    },
    series: [
      {
        name: 'Hourly Forecast',
        data: [],
        pointWidth: 50,
        zones: [
          {
            value: 0,
            color: '#486eb1'
          },
          {
            value: 5,
            color: '#fea82f'
          },
          {
            color: '#BA181B'
          }
        ],
        color: null
      }
    ],
    xAxis: {
      type: 'categories',
      categories: Charts.chartHours(),
      min: 0,
      // eslint-disable-next-line no-restricted-globals
      max: innerWidth > 600 ? 10 : 5,
      scrollbar: {
        enabled: true,
        barBorderWidth: 0,
        buttonBorderWidth: 0,
        barBackgroundColor: 'gray',
        buttonBackgroundColor: 'silver',
        trackBorderWidth: 1,
        trackBorderColor: 'gray',
        height: 30
      },
      tickLength: 0,
      rangeSelector: {
        selected: 1
      }
    },
    yAxis: {
      title: {
        text: null
      },
      labels: {
        enabled: false
      }
    },
    tooltip: {
      followPointer: true,
      crosshairs: true,
      shared: true,
      // @ts-ignore
      formatter() {
        // @ts-ignore
        return this.points.reduce(
          (s: any, point: { y: any; series: { name: string } }) => `Hour: ${s}<br/>Celsius:${point.y}${Charts.metricUnitSetter(point.series.name)}`,
          // @ts-ignore
          `<b>${this.x}</b>`
        );
      }
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chart: {
            panning: true
          }
        }
      ]
    }
  };

  private static chartHours() {
    const date = new Date();
    let currentHour = date.getHours();
    const hours = [];
    let n = 0;
    while (n < 48) {
      if (currentHour === 23) {
        currentHour = 0;
      } else {
        currentHour += 1;
      }
      hours.push(currentHour);
      n += 1;
    }
    return hours.map(x => `${x}:00`);
  }

  /*eslint-disable */

  // animation for chart when loads
  private static easeOutBounce(pos: number) {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    }
    if (pos < 2 / 2.75) {
      return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    }
    if (pos < 2.5 / 2.75) {
      return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    }
    return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
  }

  /* eslint-enable */

  private static metricUnitSetter(name: string) {
    let unit;
    if (name === 'Wind') {
      unit = 'm/s';
    } else {
      unit = '°C';
    }
    return unit;
  }

  private static pastWeekDays(array: any[], today: number) {
    let week: any[];
    if (today === 0) {
      const firstEl = array[array.length - 1];
      week = array.slice(0);
      week.unshift(firstEl);
    } else {
      week = array.slice(today - 1, array.length).concat(array.slice(0, today));
      week.push(week[0]);
    }
    return week;
  }
}
