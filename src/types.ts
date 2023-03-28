export type EsBuildConfig = {
  concurrency?: number
  disableIncremental?: boolean
  exclude?: Array<string>
  installExtraArgs?: Array<string>
  keepOutputDirectory?: boolean
  nativeZip?: boolean
  outputBuildFolder?: string
  outputWorkFolder?: string
  outputFileExtension?: string
  packagePath?: string
  packager?: 'npm' | 'yarn' | 'pnpm'
  packagerOptions?: Record<string, any>
  watch?: Record<string, any>
  bundle?: true
  minify?: boolean
  platform?: 'node' | 'format' | 'esm'
  define?: Record<string, any>
  scripts?: string | Array<string>
  pattern?: string | Array<string>
  ignore?: string | Array<string>
}
