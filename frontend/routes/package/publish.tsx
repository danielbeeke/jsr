// Copyright 2024 the JSR authors. All rights reserved. MIT license.
// deno-lint-ignore-file react-no-danger
import { HttpError, RouteConfig } from "fresh";
import type { FullUser, Package } from "../../utils/api_types.ts";
import { define } from "../../util.ts";
import { packageData } from "../../utils/data.ts";
import { GitHubActionsLink } from "../../islands/GitHubActionsLink.tsx";
import { PackageNav, Params } from "./(_components)/PackageNav.tsx";
import { PackageHeader } from "./(_components)/PackageHeader.tsx";
import TbBrandGithub from "tb-icons/TbBrandGithub";
import { scopeIAM } from "../../utils/iam.ts";
import { CopyButton } from "../../islands/CopyButton.tsx";

export default define.page<typeof handler>(function PackagePage({
  data,
  params,
  state,
}) {
  return (
    <div class="mb-20">
      <PackageHeader
        package={data.package}
        downloads={data.downloads}
      />

      <PackageNav
        currentTab="Publish"
        versionCount={data.package.versionCount}
        dependencyCount={data.package.dependencyCount}
        dependentCount={data.package.dependentCount}
        iam={data.iam}
        params={params as unknown as Params}
        latestVersion={data.package.latestVersion}
      />
      <div class="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-y-8 lg:gap-x-16">
        <div>
          <h2 class="font-bold text-2xl lg:text-3xl mb-8 text-balance">
            How to publish:
          </h2>
          <div class="space-y-16">
            <div
              class="w-full"
              id="config"
            >
              <h3 class="font-bold text-xl lg:text-2xl">1. Configure</h3>
              <div class="flex flex-col mt-4 gap-2">
                <p>
                  Add{" "}
                  <code class="text-slate-500 dark:text-slate-400">
                    "name"
                  </code>,
                  <code class="text-slate-500 dark:text-slate-400">
                    "version"
                  </code>, and{" "}
                  <code class="text-slate-500 dark:text-slate-400">
                    "exports"
                  </code>{" "}
                  fields to your config file:
                </p>
                <div class="mt-2 -mb-2">
                  <div class="bg-jsr-gray-700 text-white rounded-t font-mono text-sm px-2 py-0.5 inline-block select-none">
                    jsr.json / deno.json(c)
                  </div>
                </div>
                <pre class="bg-slate-900 dark:bg-slate-800 text-white rounded-lg rounded-tl-none p-4 mb-2 w-full max-w-full overflow-auto">
                <code>
                  {`{\n`}
                  {"  "}
                  <span class="bg-[rgba(134,239,172,.25)] text-[rgba(190,242,100)]">{`"name": "@${data.package.scope}/${data.package.name}",\n`}</span>
                  {"  "}
                  <span class="bg-[rgba(134,239,172,.25)] text-[rgba(190,242,100)]">{`"version": "0.1.0",\n`}</span>
                  {"  "}
                  <span class="bg-[rgba(134,239,172,.25)] text-[rgba(190,242,100)]">{`"license": "MIT",\n`}</span>
                  {"  "}
                  <span class="bg-[rgba(134,239,172,.25)] text-[rgba(190,242,100)]">{`"exports": "./mod.ts"\n`}</span>
                  {`}`}
                </code>
                </pre>
                <p>
                  The version must be in{" "}
                  <a
                    href="https://semver.org"
                    class="link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SemVer
                  </a>{" "}
                  format.
                </p>
                <p>
                  The exports field specifies the entry point of your package.
                  You can specify multiple entry points by using an object
                  instead of a string.{" "}
                  <a
                    href="/docs/package-configuration#exports"
                    class="link"
                  >
                    Learn more about exports.
                  </a>
                </p>
              </div>
            </div>
            <div
              class="w-full"
              id="manually"
            >
              <div>
                <h3 class="font-bold  text-xl lg:text-2xl">
                  2. Pick a publishing method
                </h3>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-2"></div>
        <div>
          <h4 class="font-bold text-lg lg:text-xl">Publish via CLI</h4>
          <div class="flex flex-col mt-4 gap-2">
            <p>To publish your package from your terminal, run:</p>
            <pre class="bg-slate-900 dark:bg-slate-800 text-white rounded-lg p-4 my-2 w-full max-w-full overflow-auto">
              <code>
                <span class="select-none sr-none text-tertiary">$ </span>
                {` npx jsr publish`}
                <br />
                <span class="select-none sr-none text-tertiary italic">or</span>
                <br />
                <span class="select-none sr-none text-tertiary">$ </span>
                {` deno publish`}
              </code>
            </pre>
            <p>
              You will be prompted to interactively authenticate in your
              browser.
            </p>
          </div>
        </div>
        <div class="h-full w-full grid grid-cols-1 grid-rows-1 [&>*]:col-start-1 [&>*]:row-start-1 items-center justify-center">
          <hr class="border-t-1.5 border-jsr-cyan-900 dark:border-jsr-cyan-600 lg:border-l-1.5 lg:border-t-0 lg:h-full lg:mx-auto" />
          <div class="p-2 bg-white dark:bg-jsr-gray-950 text-center w-max mx-auto font-bold">
            OR
          </div>
        </div>
        <div>
          <h4 class="font-bold text-lg lg:text-xl">
            Publish from CI
          </h4>
          <div class="flex flex-col mt-4 gap-2">
            <p>
              You can automatically publish your package from GitHub Actions.
            </p>
            <GitHubActions
              pkg={data.package}
              canEdit={data.iam.canWrite}
              user={state.user ?? undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

const WORKFLOW_CODE = `\
name: Publish
on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    <span class='bg-[rgba(134,239,172,.25)] text-[rgba(190,242,100)]'>permissions:</span>
    <span class='bg-[rgba(134,239,172,.25)] text-[rgba(190,242,100)]'>  contents: read</span>
    <span class='bg-[rgba(134,239,172,.25)] text-[rgba(190,242,100)]'>  id-token: write</span>
    steps:
      - uses: actions/checkout@v4
    <span class='bg-[rgba(134,239,172,.25)] text-[rgba(190,242,100)]'>  - name: Publish package</span>
    <span class='bg-[rgba(134,239,172,.25)] text-[rgba(190,242,100)]'>    run: npx jsr publish</span>
`;

function GitHubActions({ pkg, canEdit, user }: {
  pkg: Package;
  canEdit: boolean;
  user?: FullUser;
}) {
  if (!pkg.githubRepository) {
    return (
      <>
        <div class="flex flex-col gap-4">
          <p>
            Link your GitHub repository to your package to enable publishing
            from GitHub Actions via an OIDC flow.{" "}
            <a
              href="/docs/publishing-packages#publishing-from-github-actions"
              class="underline"
            >
              Learn more.
            </a>
          </p>
          <p>
            You will need to run{" "}
            <code class="bg-jsr-gray-200 dark:bg-jsr-gray-800 px-1.5 py-0.5 rounded-sm">
              deno publish
            </code>{" "}
            or{" "}
            <code class="bg-jsr-gray-200 dark:bg-jsr-gray-800 px-1.5 py-0.5 rounded-sm">
              npx jsr publish
            </code>{" "}
            in your action.
          </p>

          {canEdit ? <GitHubActionsLink pkg={pkg} user={user} /> : (
            <p>
              Ask an admin of this scope to link the repository in the package
              settings.
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <p class="mt-4">
        This package is linked to{" "}
        <TbBrandGithub class="inline size-5 -mt-[2px]" aria-hidden />{" "}
        <span className="sr-only">GitHub</span>{" "}
        <a
          href={`https://github.com/${pkg.githubRepository.owner}/${pkg.githubRepository.name}`}
          class="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {pkg.githubRepository.owner}/{pkg.githubRepository.name}
        </a>
        . No secrets are required when publishing from GitHub Actions.
        Authentication happens automatically using{"  "}
        <a
          href="https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect"
          class="hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          OIDC
        </a>
        .{" "}
      </p>
      <p class="mt-4">
        Set up your workflow with OIDC permissions and a step to run{" "}
        <code class="bg-slate-900 dark:bg-jsr-gray-950 text-white rounded py-[1px] px-2 text-sm">
          npx jsr publish
        </code>:
      </p>

      <div class="mt-2 -mb-2 flex items-center gap-1">
        <div class="bg-jsr-gray-700 dark:bg-jsr-gray-900 text-white rounded-t font-mono text-sm px-2 py-0.5 inline-block select-none">
          .github/workflows/publish.yml
        </div>
        <CopyButton
          text=".github/workflows/publish.yml"
          title="Copy workflow path"
        />
      </div>
      <pre class="bg-slate-900 text-white rounded-lg rounded-tl-none p-4 mb-2 w-full max-w-full overflow-auto relative">
      	<div class="bg-white dark:bg-jsr-gray-900 text-white rounded p-0.5 absolute top-2 right-2 z-1 size-8 flex justify-center items-center">
		<CopyButton
		  text={WORKFLOW_CODE.replace(/<[^>]+>/g, '')}
		  title="Copy workflow code"
		/>
	</div>
        <code
          dangerouslySetInnerHTML={{__html: WORKFLOW_CODE}}>
        </code>
      </pre>

      <p class="mt-4">
        You can also use{" "}
        <code class="bg-slate-900 dark:bg-slate-800 text-white rounded py-[1px] px-2 text-sm">
          deno publish
        </code>{" "}
        instead of{" "}
        <code class="bg-slate-900 dark:bg-slate-800 text-white rounded py-[1px] px-2 text-sm">
          npx jsr publish
        </code>. When doing that, make sure to install Deno in your workflow
        first.
      </p>
    </>
  );
}

export const handler = define.handlers({
  async GET(ctx) {
    const [user, data] = await Promise.all([
      ctx.state.userPromise,
      packageData(ctx.state, ctx.params.scope, ctx.params.package),
    ]);
    if (user instanceof Response) return user;
    if (!data) {
      throw new HttpError(404, "This package was not found.");
    }

    const { pkg, scopeMember, downloads } = data;

    const iam = scopeIAM(ctx.state, scopeMember, user);
    if (!iam.canWrite) {
      throw new HttpError(404, "This package was not found.");
    }

    ctx.state.meta = {
      title: `Publish instructions - @${pkg.scope}/${pkg.name} - JSR`,
      description: `@${pkg.scope}/${pkg.name} on JSR${
        pkg.description ? `: ${pkg.description}` : ""
      }`,
    };
    return {
      data: {
        package: pkg,
        downloads,
        iam,
      },
    };
  },
});

export const config: RouteConfig = {
  routeOverride: "/@:scope/:package/publish",
};
