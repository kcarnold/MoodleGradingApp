import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ViewChild, EventEmitter} from '@angular/core';
import { Subject } from 'rxjs';
import { DynamicGrid } from './grid.model';
import { FeedbackService, FeedbackStrings, HomeworkFeedback, StudentInfo } from './feedback.service';
import { event } from 'cypress/types/jquery';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexYAxis,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexPlotOptions,
  ApexAnnotations,
  ApexFill,
  ApexStroke,
  ApexGrid,
  ApexStates,
  ApexTooltip
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  annotations: ApexAnnotations;
  fill: ApexFill;
  stroke: ApexStroke;
  grid: ApexGrid;
  states: ApexStates;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {
  public feedbackArray: FormArray;
  public maxScore: String;
  public feedbackInputText: String;
  public showChart: boolean = false;
  public averageScore: number = 0;
  public minScore: number = 0;
  public maxScoreStat: number = 0;

  public feedbackText: String = '';
  
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  validFile: boolean = true;
  currentStudentName: String;
  currentStudentIndex: number = -1;
  isRowSelected: boolean =  false;
  previousRow: number = 2;
  selectedUser: Array<String>[] = [];
  studentRow: string[] = ['i', 'name', 'email', 'timestamp', 'grade', 'feedback'];

  csvRecords: StudentInfo[];
  feedback: HomeworkFeedback[];
  feedbackCount: HomeworkFeedback[] = [];
  feedbackStrings: FeedbackStrings[] = [];
  header: boolean = false;

  dynamicArray: Array<DynamicGrid> = [];  
  newDynamic: any = {}; 

  //disable check boxes when no csv is imported
  isCheckDisabled: boolean = true;

  constructor(private fb: FormBuilder, private feedbackService: FeedbackService) {
    this.newDynamic = {feedback: "", deduction:"", selected:""};  
    this.dynamicArray.push(this.newDynamic);
    this.feedbackService.feeedbackCreate(null, null);

    this.chartOptions = {
      series: [
        {
          name: "Grades",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      ],
      chart: {
        foreColor: '#FFFFFF',
        height: 400,
        type: "bar",
        toolbar: {
          show: false
        }
      },
      title: {
        text: "Grade Distribution",
        align: "center"
      },
      yaxis: {
        title: {
          text: "No. of Students"
        }
      },
      xaxis: {
        title: {
          text: "Grades"
        },
        categories: ["0-9", "10-19",  "20-29",  "30-39",  "40-49",  "50-59",  "60-69",  "70-79", "80-89", "90-100"]
      },
      states: {
        hover: {
          filter: {
            type: "none"
          }
        }
      },
    };
  }

  async fileChangeListener ($event: any) {
    // clear current table
    // display warning if student table is not empty
    console.log(this.csvRecords);
    console.log(this.csvRecords != undefined);
    if (this.csvRecords != undefined) {
      if (confirm("Are you sure you want to upload another CSV file? Your current work will be deleted!")) {
        // do nothing
        console.log("User pressed Yes!");
      } else {
        console.log("User pressed No!");
        return;
      }
    }

    this.feedbackService.clearStudents();
    // Select the file from the event
    const file = $event.srcElement.files;
    // wait for this to return
    await this.feedbackService.parseFile(file).subscribe(
      result => {
        if (result instanceof Array) {
          this.feedbackService.parseCSV(result)
          this.csvRecords = this.feedbackService.fillChart();
          this.validFile = this.feedbackService.correctFile;
          if (this.validFile) {
            // select and highlist first student
            this.currentStudentIndex = 0;
            this.maxScore = this.feedbackService.maxScore;
            // get feedback strings to display
            this.feedbackStrings = this.feedbackService.getFeedbackStrings();
            // enable checkboxes
            this.isCheckDisabled = null;
            // uncheck check boxes
            this.updateCheckboxState();
            // reset chart data
            this.updateSeries();
          } else {
            this.maxScore = null;
            console.log('Error Bad CSV');
          }
        } else {
          // handle empty CSV
          this.maxScore = null;
          this.validFile = false;
          this.csvRecords = [];
          console.log('Error', result);
        }
      }
    )  
  }

  ngOnInit(): void {
    // no-op
  }

  highlightRow(row:number) {
    // add 'selected' class to tr element
    var trs = document.querySelectorAll("tr.csv-data");
    if (this.isRowSelected === false) {
      this.isRowSelected = true;
    } else {
      trs[this.previousRow].classList.remove("selected");
    }
    trs[row].classList.add("selected");
    this.previousRow = row;
  }

  rowSelected(index:number) {
    this.currentStudentIndex = index;
    this.currentStudentName = this.csvRecords[index].fullName;
    this.maxScore = this.csvRecords[0].maxGrade;
    // code to check boxes off when on a certain student
    this.updateCheckboxState();
    // console.log(this.csvRecords);
  }

  updateCheckboxState() {
    console.log("Update Check Boxes");
    for (var i = 0; i < this.csvRecords[this.currentStudentIndex].feedbackBoolean.length; i++) {
      var checkbox = document.getElementById("checkbox" + i.toString()) as HTMLInputElement;
      if (this.csvRecords[this.currentStudentIndex].feedbackBoolean[i] === true) {
        checkbox.checked = true;
      } else {
        checkbox.checked = false;
      }
    }
  }

  studentParser(incriment: number): void {
    if (this.currentStudentIndex === 0 && incriment === -1 || this.currentStudentIndex === this.csvRecords.length-1 && incriment === 1) {
      return
    }
    this.currentStudentIndex += incriment;
    this.rowSelected(this.currentStudentIndex);
    this.highlightRow(this.currentStudentIndex);
    this.validFile = this.feedbackService.correctFile
  }

  nextStudent(): void {
    this.studentParser(1);
  }

  previousStudent(): void {
    if(this.currentStudentIndex > 0) {
      this.studentParser(-1); 
    }
  }

  addRow(): void {    
    this.newDynamic = {feedback: "", deduction:"", selected:""};  
    this.dynamicArray.push(this.newDynamic);  
    // create another feedback object
    this.feedbackService.feeedbackCreate(null, null)
    console.log(this.dynamicArray);  
    return;  
  } 

  deleteRow(index: number) {  
    // add row so there will never be 0 rows
    if(this.dynamicArray.length == 1) {
      this.addRow();
    }
      this.dynamicArray.splice(index, 1);  
      this.feedbackService.feedbackDelete(index);
    
    // update students' feedback string display
    this.updateCheckboxState();
    this.feedbackStrings = this.feedbackService.getFeedbackStrings();
    this.updateSeries();
  }

  onFeedbackChange(newValue: string, index: number) {
    this.feedbackService.feedbackStringUpdate(index, newValue);
    // update students' feedback string display
    this.feedbackStrings = this.feedbackService.getFeedbackStrings();
    this.updateSeries();
  }

  onDeductionChange(newValue: number, index: number) {
    this.feedbackService.feedbackDeductionUpdate(index, newValue);
    this.feedbackStrings = this.feedbackService.getFeedbackStrings();
    this.updateSeries();
  }

  onSelectedChange(newValue: boolean, feedbackIndex: number) {
    if (this.currentStudentIndex == 0) {
      this.highlightRow(this.currentStudentIndex);  
    }

    if (this.currentStudentIndex >= 0) {
      if (newValue === true) {
        this.feedbackService.feedbackApply(feedbackIndex, this.currentStudentIndex);
      } else {
        this.feedbackService.feedbackUnapply(feedbackIndex, this.currentStudentIndex);
      }
      // update students' feedback string display
      this.feedbackStrings = this.feedbackService.getFeedbackStrings();
      this.updateSeries();
    }
  }

  perfectScore() {
    if(this.currentStudentIndex >= 0) {
      this.feedbackService.perfectGrade(this.currentStudentIndex);
    }
    this.updateCheckboxState();
    // update students' feedback string display
    this.feedbackStrings = this.feedbackService.getFeedbackStrings();
    this.updateSeries();
  }

  clearScore() {
    if(this.currentStudentIndex >= 0) {
      this.feedbackService.clearGrade(this.currentStudentIndex);
    }
    this.updateCheckboxState();
    // update students' feedback string display
    this.feedbackStrings = this.feedbackService.getFeedbackStrings();
    console.log(this.feedbackCount);
    this.updateSeries();
  }

  // To Do: Delete Later! Useful for Debugging!
  tempFunction() {
    this.feedback = this.feedbackService.feedbackRead();
    console.log(this.feedback);
    console.log(this.feedbackCount);
    console.log(this.csvRecords);
  }

  updateSeries() {
    let chartData: Array<number> = this.feedbackService.updateChartData();
    // update data in chart
    this.chartOptions.series = [{
      data: chartData
    }];
    this.feedbackCount = this.feedbackService.updateFeedbackCount();
    this.averageScore = this.feedbackService.updateAverageStat();
    [this.minScore, this.maxScoreStat] = this.feedbackService.updateMinMaxStats();
    console.log("update chart data!")
  }

  exportCSV(): void {
    this.feedbackService.exportCSV();
    console.log("Export CSV!")
  }

  // Warn user if reloading, closing, navigating away from page.
  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    window.opener.location.reload();
  }
}
