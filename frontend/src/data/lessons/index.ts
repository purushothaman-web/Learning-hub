import type { Lesson } from '../../types/curriculum';
import { htmlCssLessons } from './html-css';
import { javascriptLessons } from './javascript';
import { reactLessons } from './react';
import { typescriptLessons } from './typescript';
import { securityLessons } from './security';
import { dockerLessons } from './docker';
import { gitLessons } from './git';
import { nodeLessons } from './node';
import { linuxLessons } from './linux';
import { websocketsLessons } from './websockets';
import { reactAdvancedLessons } from './react-advanced';
import { testingLessons } from './testing';
import { cicdLessons } from './cicd';
import { postgresqlLessons } from './postgresql';
import { redisLessons } from './redis';
import { systemDesignLessons } from './system-design';
import { awsLessons } from './aws';
import { aiOrchestrationLessons } from './ai-orchestration';
import { performanceLessons } from './performance';
import { cloudLessons } from './cloud';
import { reactNativeLessons } from './react-native';
import { networkingLessons } from './networking';
import { secureCodingLessons } from './secure-coding';
import { kubernetesLessons } from './kubernetes';
import { terraformLessons } from './terraform';
import { mobileAdvancedLessons } from './mobile-advanced';
import { pentestingLessons } from './pentesting';
import { authDeepDiveLessons } from './auth-deepdive';
import { dsaFoundationsLessons } from './dsa-foundations';
import { dsaMasteryLessons } from './dsa-mastery';
import { dsaExpertLessons } from './dsa-expert';

export const lessonsData: Record<string, Lesson[]> = {
  'html-css': htmlCssLessons,
  'javascript': javascriptLessons,
  'react': reactLessons,
  'typescript': typescriptLessons,
  'security': securityLessons,
  'docker': dockerLessons,
  'git': gitLessons,
  'node': nodeLessons,
  'linux': linuxLessons,
  'websockets': websocketsLessons,
  'react-advanced': reactAdvancedLessons,
  'testing': testingLessons,
  'cicd': cicdLessons,
  'postgresql': postgresqlLessons,
  'redis': redisLessons,
  'systemdesign': systemDesignLessons,
  'aws': awsLessons,
  'ai-orchestration': aiOrchestrationLessons,
  'performance': performanceLessons,
  'cloud': cloudLessons,
  'react-native': reactNativeLessons,
  'networking': networkingLessons,
  'secure-coding': secureCodingLessons,
  'kubernetes': kubernetesLessons,
  'terraform': terraformLessons,
  'mobile-advanced': mobileAdvancedLessons,
  'auth-deepdive': authDeepDiveLessons,
  'pentesting': pentestingLessons,
  'dsa-foundations': dsaFoundationsLessons,
  'dsa-mastery': dsaMasteryLessons,
  'dsa-expert': dsaExpertLessons,
};
