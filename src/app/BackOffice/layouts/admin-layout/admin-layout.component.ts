import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import PerfectScrollbar from 'perfect-scrollbar';
import { SidebarModule } from "../../sidebar/sidebar.module";

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  private _router!: Subscription;
  private lastPoppedUrl: string | undefined;
  private yScrollStack: number[] = [];
  private psMainPanel: any;
  private psSidebar: any;

  constructor(public location: Location, private router: Router) {}

  ngOnInit() {
    const isWindows = navigator.platform.indexOf('Win') > -1;

    if (isWindows) {
      document.body.classList.add('perfect-scrollbar-on');
    } else {
      document.body.classList.add('perfect-scrollbar-off');
    }

    const elemMainPanel = document.querySelector<HTMLElement>('.main-panel');
    const elemSidebar = document.querySelector<HTMLElement>('.sidebar .sidebar-wrapper');

    this.location.subscribe((ev: PopStateEvent) => {
      this.lastPoppedUrl = ev.url || '';
    });

    this._router = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (elemMainPanel) elemMainPanel.scrollTop = 0;
        if (elemSidebar) elemSidebar.scrollTop = 0;
      });

    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      if (elemMainPanel) {
        this.psMainPanel = new (PerfectScrollbar as any)(elemMainPanel);
      }
      if (elemSidebar) {
        this.psSidebar = new (PerfectScrollbar as any)(elemSidebar);
      }
    }
  }

  ngAfterViewInit() {
    this.runOnRouteChange();
  }

  ngOnDestroy() {
    if (this._router) {
      this._router.unsubscribe();
    }
    if (this.psMainPanel) {
      this.psMainPanel.destroy();
    }
    if (this.psSidebar) {
      this.psSidebar.destroy();
    }
  }

  isMap(path: string): boolean {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    titlee = titlee.slice(1);
    return path !== titlee;
  }

  runOnRouteChange(): void {
    const elemMainPanel = document.querySelector<HTMLElement>('.main-panel');
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac() && elemMainPanel) {
      this.psMainPanel?.update();
    }
  }

  isMac(): boolean {
    const platform = navigator.platform.toUpperCase();
    return platform.includes('MAC') || platform.includes('IPAD');
  }
}
