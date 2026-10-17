import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'autoModerationActionExecution'> = {
  name: 'autoModerationActionExecution',
  async execute(execution) {
    logger.moderation(
      `native_automod guild=${execution.guild.id} user=${execution.userId} rule=${execution.ruleId} action=${execution.action.type}`
    );
  },
};

export default event;
