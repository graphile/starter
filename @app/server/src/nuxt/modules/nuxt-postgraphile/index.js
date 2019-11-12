import { join } from 'path'
import consola from 'consola'
import chalk from 'chalk'
import { postgraphile, makePluginHook } from 'postgraphile'
import PGConsolaHookPlugin from './pg-plugins/consola'

const logger = consola.withScope('postgraphile')

export default function (moduleOptions) {
  const config = this.options.postgraphile || moduleOptions || {}

  // See https://www.graphile.org/postgraphile/usage-library/#api-postgraphilepgconfig-schemaname-options
  config.pgConfig = config.pgConfig || 'postgres:///'
  // Learn about namespaces: https://www.graphile.org/postgraphile/namespaces/
  config.schemaName = config.schemaName || 'public'
  config.options = config.options || {}
  // Activate graphiql on dev
  if (this.options.dev && typeof config.options.graphiql === 'undefined') {
    config.options.graphiql = true
  }
  // Activate enhanceGraphiql graphiql on dev
  if (this.options.dev && typeof config.options.enhanceGraphiql === 'undefined') {
    config.options.enhanceGraphiql = true
  }
  // options.pluginHook
  const hookPlugins = config.options.hookPlugins || []
  // Add consola hook plugin
  hookPlugins.push(PGConsolaHookPlugin({ logger }))
  // Generate options.pluginHook
  config.options.pluginHook = makePluginHook(hookPlugins)

  // Add server middleware
  // TODO: Use Nuxt workers + watch postgraphile files related to restart own worker
  logger.info(`Connecting PostGraphile to ${config.pgConfig}`)
  this.addServerMiddleware({
    path: '/postgraphile',
    handler: postgraphile(config.pgConfig, config.schemaName, config.options)
  })

  // Log server infos
  this.nuxt.hook('listen', (server, { https, host, port }) => {
    const serverUrl = `http${https ? 's' : ''}://${host}:${port}/postgraphile`

    this.options.cli.badgeMessages.push(`${chalk.cyan('GraphQL')}: ${serverUrl}/graphql`)
    if (config.options.graphiql) {
      this.options.cli.badgeMessages.push(`${chalk.magenta('GraphiQL')}: ${serverUrl}/graphiql`)
    }
  })
}
