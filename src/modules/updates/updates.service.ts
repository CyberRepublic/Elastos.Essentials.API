import simpleGit from "simple-git";
import { SecretConfig } from "../../config/env-secret";
import logger from "../../logger";
import { DataOrError, dataOrErrorData, invalidParamError } from "../../model/dataorerror";

export type CheckedVersion = {
  platform: "android" | "ios";
  userVersion: string; // Current version given by the user
  userVersionCode: number; // eg: 20503
  latestVersion: string; // Most recent version string for the platform. Eg: "2.5.4"
  latestVersionCode: number; // eg: 20504
  gitTag: string; // Release tag on git
  shouldUpdate: boolean;
}

const FETCH_TAGS_INTERVAL_SEC = 60;

class UpdatesService {
  private latestReleaseTags: { [platform: string]: string } = {}; // eg: release-android-v2.5.4
  private latestReleaseVersions: { [platform: string]: number } = {}; // eg: 20504

  public async init(): Promise<void> {
    await this.fetchGitReleaseTags(); // Don't catch errors here. We must get tags at least when starting.
  }

  /**
   * Fetches the most recent release tags from git, for the 2 platforms, and stores them locally.
   */
  private async fetchGitReleaseTags() {
    let git = simpleGit(SecretConfig.Git.essentialsRepoPath);

    // Fetch latest tags
    await git.fetch();

    let tagsResult = await git.tags({
      "--sort": "-creatordate"
    });
    if (!tagsResult)
      throw new Error("Failed to fetch Essentials git tags");

    // Filter tags
    let tags = tagsResult.all.filter(t => t.startsWith("release-"));
    logger.info(`Found ${tags.length} release tags`);

    // Find latest tags per platform
    this.latestReleaseTags["android"] = tags.find(t => t.startsWith("release-android"));
    this.latestReleaseTags["ios"] = tags.find(t => t.startsWith("release-ios"));

    // Compute the numeric versions
    this.latestReleaseVersions["android"] = this.toNumericVersion(this.tagToVersion(this.latestReleaseTags["android"]));
    this.latestReleaseVersions["ios"] = this.toNumericVersion(this.tagToVersion(this.latestReleaseTags["ios"]));

    logger.info(`Latest android tag is: ${this.latestReleaseTags["android"]}`);
    logger.info(`Latest iOS tag is: ${this.latestReleaseTags["ios"]}`);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => {
      try {
        await this.fetchGitReleaseTags();
      }
      catch (e) {
        logger.warn("Git fetch tags error", e);
      }
    }, FETCH_TAGS_INTERVAL_SEC * 1000);
  }

  public checkVersion(userVersion: string, userPlatform: string): DataOrError<CheckedVersion> {
    try {
      let numericUserVersion = this.toNumericVersion(userVersion); // eg: 20503
      let numericLatestVersion = this.latestReleaseVersions[userPlatform]; // eg: 20504

      let checkedVersion: CheckedVersion = {
        platform: <any>userPlatform,
        userVersion: userVersion,
        userVersionCode: numericUserVersion,
        latestVersion: this.tagToVersion(this.latestReleaseTags[userPlatform]),
        latestVersionCode: numericLatestVersion,
        gitTag: this.latestReleaseTags[userPlatform],
        shouldUpdate: numericLatestVersion > numericUserVersion
      }

      return dataOrErrorData(checkedVersion);
    }
    catch (e) {
      // Probably failed to convert to numeric version - invalid versions received
      return invalidParamError("Invalid version format", e);
    }
  }

  /**
   * From release-android-v2.5.4 to 2.5.4
   */
  private tagToVersion(tag: string): string {
    let versionIndex = tag.indexOf("-v");
    if (!versionIndex)
      throw new Error(`Cannot convert tag to version for ${tag}`);

    return tag.substring(versionIndex + 2);
  }

  private toNumericVersion(version: string): number {
    let [major, minor, fix] = version.split(".");

    let majorInt = parseInt(major);
    let minorInt = parseInt(minor);
    let fixInt = parseInt(fix);

    if (Number.isNaN(majorInt) || Number.isNaN(minorInt) || Number.isNaN(fixInt))
      throw new Error("Cannot extract numeric version. Invalid version string? " + version);

    return majorInt * 10000 + minorInt * 100 + fixInt;
  }
}

export const updatesService = new UpdatesService();