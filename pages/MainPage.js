class MainPage {
  constructor(page) {
    this.page = page;
    
    this.dashboardOption = 'span:has-text("Dashboard")';
    this.newProjectButton = 'button:has-text("New Project")';
    this.projectNameInput = 'input[name="name"]';
    this.createProjectButton = 'button[type="submit"]:has-text("Create")';
    this.canvasTab = 'button[role="tab"]:has-text("Canvas")';
    this.uploadButton = 'button:has-text("Upload")';
    this.addNodeButton = 'button[data-testid="toolbar-plus"]:has-text("Add Node")';
    this.dataInputOption = 'span:has-text("Data Input")';
    this.fromDeviceOption = 'span:has-text("From Device")';
    this.uploadInput = 'input[type="file"]';
    this.fileCheckbox = 'div.flex.h-4.w-4.rounded-full.border-2'
    this.previewButton = 'button[role="tab"]:has-text("Preview")';
    this.cleanAndFormatButton = 'button:has-text("Clean & Format")';
    this.dropColumnsOption = 'span:has-text("Drop Columns")';
    this.removeDuplicatesOption = 'span:has-text("Remove Duplicates")';
    this.selectColumnsDropdown = 'p:has-text("Select columns")';
    this.selectColumnsFields = 'div.w-48.truncate.text-left';
    this.applyButton = 'button:has-text("Apply")';
    this.downloadButton = 'button:has-text("Download")';
    this.downloadAsCSVOption = this.page.getByRole("menuitem", { name: "Download as CSV" });
    this.closeToast = 'button[aria-label="Close toast"]';
}

  async createNewProject(projectName) {
    await this.page.click(this.newProjectButton);
    await this.page.fill(this.projectNameInput, projectName);
    await this.page.click(this.createProjectButton);
    await this.page.waitForSelector(`div:has-text('${projectName}')`, { timeout: 5000 });
    await this.page.waitForSelector(this.canvasTab);
  }

  async addNodeDataInput(filePath) {
    await this.page.click(this.addNodeButton);
    await this.page.click(this.dataInputOption);
    await this.page.click(this.fromDeviceOption);
    await this.page.setInputFiles(this.uploadInput, filePath);
    await this.page.click(this.uploadButton);
    await this.page.click(this.fileCheckbox);
  }

  async addNodeDropColumns(columnToDrop) {
    await this.page.click(this.addNodeButton);
    await this.page.click(this.cleanAndFormatButton);
    await this.page.click(this.dropColumnsOption);
    await this.page.click(this.selectColumnsDropdown);
    await this.page.click(`${this.selectColumnsFields}:has-text("${columnToDrop}")`);
    await this.page.click(this.applyButton);
  }

  async addNodeRemoveDuplicates(columnToCheckForDuplicates) {
    await this.page.click(this.addNodeButton);
    await this.page.click(this.cleanAndFormatButton);
    await this.page.click(this.removeDuplicatesOption);
    await this.page.click(this.selectColumnsDropdown);
    await this.page.click(`${this.selectColumnsFields}:has-text("${columnToCheckForDuplicates}")`);
    await this.page.click(this.applyButton);
  }


  async downloadResults(fileNameToSaveAs) {
    await this.page.click(this.previewButton);
    await this.page.waitForSelector(this.downloadButton, { timeout: 20000 });
    await this.page.click(this.downloadButton);
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      await this.downloadAsCSVOption.click(),
    ]);
    await download.saveAs(`./downloads/${fileNameToSaveAs}`);
    await this.page.click(this.canvasTab);
  }

  async waitForAndCloseToast(messageText) {
    const toastSelector = `div:has-text("${messageText}")`;
    await this.page.waitForSelector(toastSelector, { timeout: 10000 });
    await this.page.click(this.closeToast);
  }
  
  async deleteAnyExistingProjects() {
    await this.page.waitForSelector(this.dashboardOption);
    const noProjects = await this.page.waitForSelector('div.truncate.text-sm.font-medium.text-muted-foreground:has-text("No Projects")', { timeout: 1000 }).catch(() => null);

    if (noProjects) {
      return;
    }

    await this.page.waitForSelector('a.group');
    const projectCards = await this.page.$$('a.group');
    for (const card of projectCards) {
      await card.hover();
      const ellipsisButton = await card.$('button svg.lucide-ellipsis');
      if (ellipsisButton) {
        await ellipsisButton.click();
        await this.page.waitForSelector('div[role="menuitem"]:has-text("Delete")');
        await this.page.click('div[role="menuitem"]:has-text("Delete")');
        await this.page.click('button.bg-destructive:has-text("Delete")');
      }
    }
  }
}

export { MainPage };