class MainPage {
  static selectors = {
    dashboardOption: 'span:has-text("Dashboard")',
    newProjectButton: 'button:has-text("New Project")',
    projectNameInput: 'input[name="name"]',
    createProjectButton: 'button[type="submit"]:has-text("Create")',
    canvasTab: 'button[role="tab"]:has-text("Canvas")',
    uploadButton: 'button:has-text("Upload")',
    addNodeButton: 'button[data-testid="toolbar-plus"]:has-text("Add Node")',
    dataInputOption: 'span:has-text("Data Input")',
    fromDeviceOption: 'span:has-text("From Device")',
    uploadInput: 'input[type="file"]',
    fileCheckbox: 'div.flex.h-4.w-4.rounded-full.border-2',
    previewButton: 'button[role="tab"]:has-text("Preview")',
    cleanAndFormatButton: 'button:has-text("Clean & Format")',
    dropColumnsOption: 'span:has-text("Drop Columns")',
    removeDuplicatesOption: 'span:has-text("Remove Duplicates")',
    selectColumnsDropdown: 'p:has-text("Select columns")',
    selectColumnsFields: 'div.w-48.truncate.text-left',
    applyButton: 'button:has-text("Apply")',
    downloadButton: 'button:has-text("Download")',
    closeToast: 'button[aria-label="Close toast"]',
    noProjects: 'div.truncate.text-sm.font-medium.text-muted-foreground:has-text("No Projects")',
    projectCard: 'a.group',
    ellipsisButton: 'button svg.lucide-ellipsis',
    deleteMenuItem: 'div[role="menuitem"]:has-text("Delete")',
    confirmDeleteButton: 'button.bg-destructive:has-text("Delete")',
    downloadAsCSVMenuItem: 'div[role="menuitem"]:has-text("Download as CSV")',
  };

  constructor(page) {
    this.page = page;
  }

  async createNewProject(projectName) {
    try {
      await this.page.click(MainPage.selectors.newProjectButton);
      await this.page.fill(MainPage.selectors.projectNameInput, projectName);
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {}),
        this.page.click(MainPage.selectors.createProjectButton)
      ]);
      await this.page.waitForSelector(`div:has-text('${projectName}')`, { timeout: 5000 });
      await this.page.waitForSelector(MainPage.selectors.canvasTab);
    } catch (err) {
      throw new Error(`Failed to create new project: ${err.message}`);
    }
  }

  async addNodeDataInput(filePath) {
    await this.page.click(MainPage.selectors.addNodeButton);
    await this.page.click(MainPage.selectors.dataInputOption);
    await this.page.click(MainPage.selectors.fromDeviceOption);
    await this.page.setInputFiles(MainPage.selectors.uploadInput, filePath);
    await this.page.click(MainPage.selectors.uploadButton);
    await this.page.click(MainPage.selectors.fileCheckbox);
  }

  async addNodeDropColumns(columnToDrop) {
    await this.page.click(MainPage.selectors.addNodeButton);
    await this.page.click(MainPage.selectors.cleanAndFormatButton);
    await this.page.click(MainPage.selectors.dropColumnsOption);
    await this.page.click(MainPage.selectors.selectColumnsDropdown);
    await this.page.click(`${MainPage.selectors.selectColumnsFields}:has-text("${columnToDrop}")`);
    await this.page.click(MainPage.selectors.applyButton);
  }

  async addNodeRemoveDuplicates(columnToCheckForDuplicates) {
    await this.page.click(MainPage.selectors.addNodeButton);
    await this.page.click(MainPage.selectors.cleanAndFormatButton);
    await this.page.click(MainPage.selectors.removeDuplicatesOption);
    await this.page.click(MainPage.selectors.selectColumnsDropdown);
    await this.page.click(`${MainPage.selectors.selectColumnsFields}:has-text("${columnToCheckForDuplicates}")`);
    await this.page.click(MainPage.selectors.applyButton);
  }

  async downloadResults(fileNameToSaveAs) {
    await this.page.click(MainPage.selectors.previewButton);
    await this.page.waitForSelector(MainPage.selectors.downloadButton, { timeout: 20000 });
    await this.page.click(MainPage.selectors.downloadButton);
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      await this.page.click(MainPage.selectors.downloadAsCSVMenuItem),
    ]);
    await download.saveAs(`./downloads/${fileNameToSaveAs}`);
    await this.page.click(MainPage.selectors.canvasTab);
  }

  async waitForAndCloseToast(messageText) {
    const toastSelector = `div:has-text("${messageText}")`;
    await this.page.waitForSelector(toastSelector, { timeout: 10000 });
    await this.page.click(MainPage.selectors.closeToast);
  }
  
  async deleteAnyExistingProjects() {
    await this.page.waitForSelector(MainPage.selectors.dashboardOption);
    const noProjects = await this.page.waitForSelector(MainPage.selectors.noProjects, { timeout: 1000 }).catch(() => null);
    if (noProjects) {
      return;
    }
    await this.page.waitForSelector(MainPage.selectors.projectCard);
    const projectCards = await this.page.$$(MainPage.selectors.projectCard);
    for (const card of projectCards) {
      await card.hover();
      const ellipsisButton = await card.$(MainPage.selectors.ellipsisButton);
      if (ellipsisButton) {
        await ellipsisButton.click();
        await this.page.waitForSelector(MainPage.selectors.deleteMenuItem);
        await this.page.click(MainPage.selectors.deleteMenuItem);
        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {}),
          this.page.click(MainPage.selectors.confirmDeleteButton)
        ]);
      }
    }
  }
}

export { MainPage };