import { expect } from "chai";
import { join } from "path";
import * as fs from "fs-extra";
import * as rimraf from "rimraf";
import * as sinon from "sinon";
import * as tmp from "tmp";

<<<<<<< HEAD

import { AppDistributionClient } from "../../appdistribution/client";

=======
import { AppDistributionClient } from "../../appdistribution/client";
>>>>>>> 5f2247bb (Use v1 API to upload release.)
import { FirebaseError } from "../../error";
import * as api from "../../api";
import * as nock from "nock";
import { Distribution, DistributionFileType } from "../../appdistribution/distribution";

tmp.setGracefulCleanup();

describe("distribution", () => {
  const tempdir = tmp.dirSync();
  const projectNumber = "123456789";
  const appId = "1:123456789:ios:abc123def456";
  const binaryFile = join(tempdir.name, "app.ipa");
  fs.ensureFileSync(binaryFile);
  const mockDistribution = new Distribution(binaryFile);
  const appDistributionClient = new AppDistributionClient(appId);

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    rimraf.sync(tempdir.name);
  });

<<<<<<< HEAD

=======
>>>>>>> 5f2247bb (Use v1 API to upload release.)
  describe("uploadRelease", () => {
    it("should throw error if upload fails", async () => {
      nock(api.appDistributionOrigin)
        .post(`/upload/v1/projects/${projectNumber}/apps/${appId}/releases:upload`)
        .reply(400, {});
      await expect(appDistributionClient.uploadRelease(mockDistribution)).to.be.rejected;
      expect(nock.isDone()).to.be.true;
    });

    it("should return token if upload succeeds", async () => {
      const fakeOperation = "fake-operation-name";
      nock(api.appDistributionOrigin)
        .post(`/upload/v1/projects/${projectNumber}/apps/${appId}/releases:upload`)
        .reply(200, { name: fakeOperation });
      await expect(appDistributionClient.uploadRelease(mockDistribution)).to.be.eventually.eq(
        fakeOperation
      );
      expect(nock.isDone()).to.be.true;
    });
  });

  describe("updateReleaseNotes", () => {
    const releaseName = `projects/${projectNumber}/apps/${appId}/releases/fake-release-id`;
    it("should return immediately when no release notes are specified", async () => {
      const apiSpy = sandbox.spy(api, "request");
      await expect(appDistributionClient.updateReleaseNotes(releaseName, "")).to.eventually.be
        .fulfilled;
      expect(apiSpy).to.not.be.called;
    });

    it("should throw error when request fails", async () => {
      nock(api.appDistributionOrigin)
        .patch(`/v1/${releaseName}?updateMask=release_notes.text`)
        .reply(400, {});
      await expect(
        appDistributionClient.updateReleaseNotes(releaseName, "release notes")
      ).to.be.rejectedWith(FirebaseError, "failed to update release notes");
      expect(nock.isDone()).to.be.true;
    });

    it("should resolve when request succeeds", async () => {
      nock(api.appDistributionOrigin)
        .patch(`/v1/${releaseName}?updateMask=release_notes.text`)
        .reply(200, {});
      await expect(appDistributionClient.updateReleaseNotes(releaseName, "release notes")).to
        .eventually.be.fulfilled;
      expect(nock.isDone()).to.be.true;
    });
  });

  describe("distribute", () => {
    const releaseName = `projects/${projectNumber}/apps/${appId}/releases/fake-release-id`;
    it("should return immediately when testers and groups are empty", async () => {
      const apiSpy = sandbox.spy(api, "request");
      await expect(appDistributionClient.distribute(releaseName)).to.eventually.be.fulfilled;
      expect(apiSpy).to.not.be.called;
    });

    it("should resolve when request succeeds", async () => {
      nock(api.appDistributionOrigin).post(`/v1/${releaseName}:distribute`).reply(200, {});
      await expect(appDistributionClient.distribute(releaseName, ["tester1"], ["group1"])).to.be
        .fulfilled;
      expect(nock.isDone()).to.be.true;
    });

    describe("when request fails", () => {
      let testers: string[];
      let groups: string[];
      beforeEach(() => {
        testers = ["tester1"];
        groups = ["group1"];
      });

      it("should throw invalid testers error when status code is FAILED_PRECONDITION ", async () => {
        nock(api.appDistributionOrigin)
          .post(`/v1/${releaseName}:distribute`, {
            testerEmails: testers,
            groupAliases: groups,
          })
          .reply(412, { error: { status: "FAILED_PRECONDITION" } });
        await expect(
          appDistributionClient.distribute(releaseName, testers, groups)
        ).to.be.rejectedWith(
          FirebaseError,
          "failed to distribute to testers/groups: invalid testers"
        );
        expect(nock.isDone()).to.be.true;
      });

      it("should throw invalid groups error when status code is INVALID_ARGUMENT", async () => {
        nock(api.appDistributionOrigin)
          .post(`/v1/${releaseName}:distribute`, {
            testerEmails: testers,
            groupAliases: groups,
          })
          .reply(412, { error: { status: "INVALID_ARGUMENT" } });
        await expect(
          appDistributionClient.distribute(releaseName, testers, groups)
        ).to.be.rejectedWith(
          FirebaseError,
          "failed to distribute to testers/groups: invalid groups"
        );
        expect(nock.isDone()).to.be.true;
      });

      it("should throw default error", async () => {
        nock(api.appDistributionOrigin)
          .post(`/v1/${releaseName}:distribute`, {
            testerEmails: testers,
            groupAliases: groups,
          })
          .reply(400, {});
        await expect(
          appDistributionClient.distribute(releaseName, ["tester1"], ["group1"])
        ).to.be.rejectedWith(FirebaseError, "failed to distribute to testers/groups");
        expect(nock.isDone()).to.be.true;
      });
    });
  });
});
