import { Octokit } from 'octokit'

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

const OWNER = process.env.GITHUB_OWNER!
const REPO = process.env.GITHUB_REPO!
const WORKFLOW_ID = 'render.yml'

export interface TriggerRenderParams {
    taskId: string
    composition: string
    props: Record<string, unknown>
    outputFileName?: string
}

/**
 * 触发 GitHub Actions 渲染任务
 */
export async function triggerRender(params: TriggerRenderParams) {
    const { taskId, composition, props, outputFileName } = params

    const response = await octokit.rest.actions.createWorkflowDispatch({
        owner: OWNER,
        repo: REPO,
        workflow_id: WORKFLOW_ID,
        ref: 'main',
        inputs: {
            task_id: taskId,
            composition,
            props: JSON.stringify(props),
            output_file_name: outputFileName ?? `${taskId}.mp4`,
        },
    })

    return response
}

/**
 * 获取 workflow run 状态
 */
export async function getWorkflowRun(runId: string) {
    const response = await octokit.rest.actions.getWorkflowRun({
        owner: OWNER,
        repo: REPO,
        run_id: Number(runId),
    })
    return response.data
}

/**
 * 获取最新的 workflow runs
 */
export async function listWorkflowRuns(limit = 10) {
    const response = await octokit.rest.actions.listWorkflowRuns({
        owner: OWNER,
        repo: REPO,
        workflow_id: WORKFLOW_ID,
        per_page: limit,
    })
    return response.data.workflow_runs
}
