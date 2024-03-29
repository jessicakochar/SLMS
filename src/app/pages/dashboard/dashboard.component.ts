import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CHART_OPTIONS } from './../../variables/charts';
import Chart from 'chart.js';
// import { CHART_OPTIONS, CHART_OPTIONS_2, GlobalDailyStatsCollection, GlobalMonthlyStatsCollection } from 'src/app/Utils/util';
// import { Color, Label } from 'ng2-charts';

import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2
} from "../../variables/charts";
import { Firestore, collection, documentId, getDocs, getFirestore, onSnapshot, query, where } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  public datasets: any;
  public data: any;
  public salesChart;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  selectedYear: number = new Date().getFullYear();

  chartData = [];
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  chartLabels: string[] = [];
  issuedData: number[] = [];
  returnedData: number[] = [];

  datepipe: DatePipe = new DatePipe('en-US');
  currentDate: Date = new Date();
  selectedMonth: Date = this.currentDate;

  totalBooksCount: number = 0;
  totalMembersCount: number = 0;
  totalBooksSum: number = 0;
  totalBooksIssued: number = 0;
  totalBooksAvailable: number = 0;
  yearStatModel: { [key: string]: any } = {};

  monthlyData: number[] = Array(12).fill(0);

  @ViewChild('monthlyTrendChart', { static: false }) monthlyTrendChart: ElementRef<HTMLCanvasElement>;
  monthlyTrendChartRef: any;

  monthsArray: Date[] = [];
  years: number[] = [];

  constructor(
    private firestore: Firestore
  ) {

  }

  ngAfterViewInit() {
    this.renderMonthlyTrendChart();
  }

  ngOnInit() {

    this.configureMonthsArray();
    this.fetchGlobalStats();
    this.fetchTotalBooksCount();

    for (let idx = 2022; idx <= (new Date().getFullYear()); idx++) {
      this.years.push(idx)
    }
    // this.datasets = [

    //   [0, 20, 10, 30, 15, 40, 20, 60, 60],
    //   [0, 20, 5, 25, 10, 30, 15, 40, 40]
    // ];
    // this.data = this.datasets[0];


    // var chartOrders = document.getElementById('chart-orders');

    // parseOptions(Chart, chartOptions());


    // var ordersChart = new Chart(chartOrders, {
    //   type: 'bar',
    //   options: chartExample2.options,
    //   data: chartExample2.data
    // });

    // var chartSales = document.getElementById('chart-sales');

    // this.salesChart = new Chart(chartSales, {
    // 	type: 'line',
    // 	options: chartExample1.options,
    // 	data: chartExample1.data
    // });
  }

  onYearSelection(year: any) {
    this.currentDate = new Date(+year, 0, 1);
    this.fetchGlobalStats();
    this.configureMonthsArray();
  }

  configureMonthsArray() {
    let yearStart = new Date(this.currentDate.getFullYear(), 0, 1);
    this.monthsArray = Array(12).fill(0).map((_, idx) => {
      yearStart.setMonth(idx)
      return new Date(yearStart);
    });
  }

  fetchYearlyPatientStats(year?) {
    let yearStart = new Date(this.currentDate.getFullYear(), 0, 1);
    let docIds = Array(12).fill(0).map((_, idx) => {
      yearStart.setMonth(idx)
      return new DatePipe('en-US').transform(yearStart, 'yyyyMM')
    });
  }

  async fetchTotalBooksCount() {
    try {
      const firestore = getFirestore();
      const booksCollectionRef = collection(firestore, 'globalStats');
      const querySnapshot = await getDocs(booksCollectionRef);

      let totalMembers = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.members) {
          totalMembers += data.members;
        }
      });

      // Update the totalMembers variable with the total number of members from all documents in the collection.
      this.totalMembersCount = totalMembers;

      // Update the totalBooksCount variable with the count of documents
      let count = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.totalBooks) {
          count += data.totalBooks;
        }
      });
      this.totalBooksCount = count;

      let sum = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.Quantity) {
          sum += data.Quantity;
        }
      });
      this.totalBooksSum = sum;

      let issue = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.issued) {
          issue += data.issued;
        }
      });
      this.totalBooksIssued = issue;

      let returns = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.returns) {
          returns += data.returns;
        }
      });
      this.totalBooksAvailable = this.totalBooksSum - this.totalBooksIssued;

    } catch (error) {
      console.error('Error fetching total books count:', error);
    }
  }


  // fetchGlobalStats() {
  //   const firestore = getFirestore(); // Ensure you have imported the necessary firestore functions.

  //   const globalStatsCollectionRef = collection(firestore, 'globalStats');
  //   const queryRef = query(globalStatsCollectionRef);

  //   onSnapshot(queryRef, (snapshot) => {
  //     const statsData = [];
  //     snapshot.forEach((doc) => {
  //       const data = doc.data();
  //       // Parse the document ID (e.g., '202309') to extract year and month information.
  //       const year = parseInt(doc.id.substr(0, 4), 10);
  //       const month = parseInt(doc.id.substr(4, 2), 10);
  //       statsData.push({ year, month, ...data });
  //     });

  //     // Process the statsData array containing data for all months and years.
  //     this.processData(statsData);
  //     console.log(statsData);
  //     this.renderMonthlyTrendChart();
  //   });
  // }

  getDocs(monthId) {
    return getDocs(query(
      collection(this.firestore, 'globalStats'),
      where(documentId(), 'in', monthId)
    ));
  }

  fetchGlobalStats(year?) {
    let yearStart = new Date(this.currentDate.getFullYear(), 0, 1);
    let docIds = Array(12).fill(0).map((_, idx) => {
      yearStart.setMonth(idx)
      return new DatePipe('en-US').transform(yearStart, 'yyyyMM')
    });

    let halfIdx = docIds.length / 2;
    Promise.all([
      this.getDocs(docIds.slice(0, halfIdx)),
      this.getDocs(docIds.slice(halfIdx))
    ]).then((resp) => {
      let statsModelList = resp.flatMap(ele => ele.docs.map(e => e.data()));
      this.yearStatModel = docIds.reduce((prev, nextMonthYearId) => {
        let statIdx = statsModelList.findIndex(x => x.monthID === nextMonthYearId);
        return {
          ...prev,
          [nextMonthYearId]: statsModelList[statIdx] ?? {}
        }
      }, {});
      this.renderMonthlyTrendChart()

    });
  }

  renderMonthlyTrendChart() {
    if (this.monthlyTrendChartRef !== undefined) this.monthlyTrendChartRef.destroy();
    let ctx = this.monthlyTrendChart.nativeElement.getContext("2d") ?? null;

    this.monthlyTrendChartRef = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.monthsArray.map(e => this.datepipe.transform(e, 'MMMM')),
        datasets: [
          {
            label: 'Issued Books',
            data: Object.values(this.yearStatModel).map((ele) => ele?.issued ?? 0),
            yAxisID: 'B',
            backgroundColor: '#f59a00'
          },
          {
            label: 'Returned Books',
            data: Object.values(this.yearStatModel).map((ele) => ele?.returns ?? 0),
            yAxisID: 'B',
            backgroundColor: '#004545'
          },
        ],
      },
      options: { ...CHART_OPTIONS }
    });

    this.monthlyTrendChartRef.update();
  }

}
