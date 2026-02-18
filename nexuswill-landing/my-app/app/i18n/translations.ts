export type Language = 'en' | 'zh' | 'sw' | 'ja' | 'zu' | 'ru';

export const languages: { code: Language; name: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦', dir: 'ltr' },
];

export const translations = {
  en: {
    nav: {
      brand: 'Nexus Will',
      setSail: 'Set Sail',
      explore: 'Explore',
    },
    hero: {
      badge: 'The era of AI is here',
      headline1: 'Welcome to the',
      headline2: 'Grand Line',
      subline1: 'Software development is no longer a job.',
      subline2: 'It is an',
      subline2Highlight: 'adventure',
      subline3: 'The AI sea is wild.',
      subline4: 'Only those with Will survive.',
      ctaPrimary: 'Set Sail',
      ctaSecondary: 'Explore the Map',
      scrollIndicator: 'Descend',
      footer: 'The old rules are gone. AI is the sea. Will is the compass.',
      tag1: 'AI-Native',
      tag2: 'Developer First',
      tag3: 'Future Proof',
    },
    grandLine: {
      badge: 'The Grand Line',
      headline: 'This is where',
      headlineHighlight: '99%',
      headlineEnd: 'of teams get lost',
      description: 'The chaotic, beautiful reality of building software today with AI. Dangerous waters, unexpected challenges, legends being born.',
      quote: 'We give you the',
      quoteHighlight: 'Log Pose',
      mapHint: 'Click islands to explore',
      mapRoute: 'Your route',
      islands: {
        bugHell: {
          name: 'Bug Hell',
          description: 'Endless debugging loops that drain your soul',
          solution: 'AI-powered error detection & resolution',
        },
        contextLoss: {
          name: 'Context Loss Cove',
          description: 'Forgetting why you wrote that code 3 days ago',
          solution: 'Persistent AI memory across sessions',
        },
        slowTeams: {
          name: 'Slow Team Lagoon',
          description: 'Reviews take forever, releases crawl',
          solution: 'Automated code review & deployment',
        },
        siloIslands: {
          name: 'Silo Islands',
          description: 'Knowledge trapped in individual minds',
          solution: 'Shared AI context for your entire crew',
        },
        legacySea: {
          name: 'Legacy Code Sea',
          description: 'Ancient codebase nobody understands',
          solution: 'AI code archaeology & modernization',
        },
      },
    },
    newWorld: {
      badge: 'The New World',
      headline: 'Where',
      headlineHighlight: 'kings',
      headlineEnd: 'emerge',
      description: 'Post-timeskip. Everything is stronger. The real legends are made here. In the New World, AI doesn\'t help you code. It',
      descriptionHighlight: 'becomes',
      descriptionEnd: 'the code.',
      features: {
        aiNative: {
          title: 'AI-Native Architecture',
          description: 'Built from the ground up for the AI era. Not bolted on, but woven in.',
        },
        lightning: {
          title: 'Lightning Fast',
          description: '10x faster development cycles. Ship in hours what used to take weeks.',
        },
        battleTested: {
          title: 'Battle Tested',
          description: 'Enterprise-grade security and reliability. The New World demands strength.',
        },
        growth: {
          title: 'Exponential Growth',
          description: 'Compound your capabilities. Each day you become more powerful than the last.',
        },
      },
      cta: {
        headline: 'We are the first ship that made it across.',
        description: 'Join the crew that\'s writing the new rules. The old frameworks, old agile, old everything dies here.',
        button: 'Enter the New World',
      },
      legends: 'Legends in the making',
    },
    skyIslands: {
      badge: 'Sky Islands',
      headline: 'Where coding feels like',
      headlineHighlight: 'cheating',
      description: 'Welcome to the elevated plane where development feels magical. AI as superpowers. Beyond human limits.',
      powers: {
        fullstack: {
          title: 'Fullstack Mastery',
          description: 'Frontend, backend, infrastructure—all unified under your Will',
        },
        dimensional: {
          title: 'Dimensional Thinking',
          description: 'See across abstractions. Understand systems within systems',
        },
        creative: {
          title: 'Creative Flow',
          description: 'Ideas manifest as working code. The barrier dissolves',
        },
        reflexes: {
          title: 'Lightning Reflexes',
          description: 'React to changes instantly. Adapt before others perceive',
        },
      },
      roadmap: {
        title: 'The Ancient Roadmap',
        subtitle: 'Poneglyphs guide the way to the ultimate treasure',
        phases: {
          phase1: {
            name: 'Nexus Helper',
            description: 'Your first weapon. Chrome extension for AI-powered coding.',
          },
          phase2: {
            name: 'The Ship',
            description: 'The full platform. App.nexuswill.com comes online.',
          },
          phase3: {
            name: 'The Crew',
            description: 'Community tools, bounties, the tavern opens.',
          },
          phase4: {
            name: 'Devil Fruits',
            description: 'Specialized AI agents for every domain.',
          },
        },
      },
      cta: {
        headline: 'Fullstack engineers become gods',
        description: 'This is the place where your skills transcend. Where you wield AI not as a tool, but as an extension of your Will.',
        primary: 'Ascend to Sky Islands',
        secondary: 'Read the Manifesto',
      },
    },
    fleet: {
      badge: 'The Fleet',
      headline: 'Chart your course',
      description: 'The Nexus Will ecosystem spans multiple domains. Each serves a unique purpose in your journey across the Grand Line.',
      footer: 'All domains are interconnected. Your progress travels with you across the fleet.',
      domains: {
        main: {
          name: 'The Grand Line',
          description: 'Main storytelling hub, blog, manifesto, crew recruitment',
        },
        app: {
          name: 'The Thousand Sunny',
          description: 'The actual platform — core product, your ship',
        },
        helper: {
          name: 'First Weapon',
          description: 'Nexus Helper — Chrome extension for AI-powered coding',
        },
        docer: {
          name: 'Poneglyphs',
          description: 'Technical bible — documentation, APIs, guides',
        },
        crew: {
          name: 'The Tavern',
          description: 'Community, forums, bounties, crew recruitment',
        },
        ai: {
          name: 'Devil Fruits',
          description: 'Future AI tools — specialized agents for every domain',
        },
      },
      statuses: {
        live: 'Live',
        beta: 'Beta',
        soon: 'Soon',
      },
    },
    captainsLog: {
      badge: "Captain's Log",
      headline: 'Tales from the',
      headlineHighlight: 'Grand Line',
      description: 'Chronicles of those who dared to sail these waters. Stories of triumph, lessons learned, and the Will that drives us forward.',
      readMore: 'Read More',
      viewAll: 'View All Logs',
    },
    crewStories: {
      badge: 'Crew Stories',
      headline: 'Voices from the',
      headlineHighlight: 'Crew',
      description: 'Hear from developers who have joined our voyage and transformed their journey across the AI seas.',
    },
    bountyBoard: {
      badge: 'Bounty Board',
      headline: 'Wanted:',
      headlineHighlight: 'Legends',
      description: 'Join our crew and earn your place in the New World. Every contribution is rewarded.',
      bounties: {
        contributor: {
          title: 'Open Source Contributor',
          reward: '500M',
          description: 'Submit PRs to our repos',
        },
        hunter: {
          title: 'Bug Hunter',
          reward: '300M',
          description: 'Find and report critical bugs',
        },
        evangelist: {
          title: 'Community Evangelist',
          reward: '200M',
          description: 'Spread the word about Nexus Will',
        },
      },
    },
    footer: {
      description: 'Welcome to the Grand Line. Software development is no longer a job. It is an adventure.',
      madeWith: 'Made with',
      for: 'for the Grand Line',
      closing: 'The sea is calling.',
      copyright: '© {year} Nexus Will. All rights reserved.',
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    language: {
      select: 'Select Language',
    },
    logPose: {
      title: 'Log Pose',
    },
  },
  zh: {
    nav: {
      brand: 'Nexus Will',
      setSail: '启航',
      explore: '探索',
    },
    hero: {
      badge: 'AI时代已经来临',
      headline1: '欢迎来到',
      headline2: '伟大航路',
      subline1: '软件开发不再只是一份工作。',
      subline2: '这是一场',
      subline2Highlight: '冒险',
      subline3: 'AI的海洋汹涌澎湃。',
      subline4: '只有拥有意志的人才能生存。',
      ctaPrimary: '启航',
      ctaSecondary: '探索地图',
      scrollIndicator: '向下',
      footer: '旧规则已经消失。AI是大海。意志是指南针。',
      tag1: 'AI原生',
      tag2: '开发者优先',
      tag3: '面向未来',
    },
    grandLine: {
      badge: '伟大航路',
      headline: '这里是',
      headlineHighlight: '99%',
      headlineEnd: '的团队迷失的地方',
      description: '用AI构建软件时混乱而美丽的现实。危险的水域，意想不到的挑战，传奇正在诞生。',
      quote: '我们给你',
      quoteHighlight: '记录指针',
      mapHint: '点击岛屿探索',
      mapRoute: '你的航线',
      islands: {
        bugHell: {
          name: 'Bug地狱',
          description: '无休止的调试循环耗尽你的灵魂',
          solution: 'AI驱动的错误检测与解决',
        },
        contextLoss: {
          name: '上下文丢失湾',
          description: '忘记三天前为什么写那段代码',
          solution: '跨会话的持久AI记忆',
        },
        slowTeams: {
          name: '慢速团队泻湖',
          description: '审查耗时太久，发布缓慢',
          solution: '自动化代码审查与部署',
        },
        siloIslands: {
          name: '孤岛',
          description: '知识被困在个人头脑中',
          solution: '为整个团队共享AI上下文',
        },
        legacySea: {
          name: '遗留代码海',
          description: '没人理解的古老代码库',
          solution: 'AI代码考古与现代化',
        },
      },
    },
    newWorld: {
      badge: '新世界',
      headline: '',
      headlineHighlight: '王者',
      headlineEnd: '崛起之地',
      description: '两年后。一切都更强大。真正的传奇在这里诞生。在新世界，AI不只是帮你写代码。它',
      descriptionHighlight: '成为',
      descriptionEnd: '代码本身。',
      features: {
        aiNative: {
          title: 'AI原生架构',
          description: '为AI时代从头开始构建。不是附加，而是编织其中。',
        },
        lightning: {
          title: '闪电般快速',
          description: '10倍更快的开发周期。几小时完成过去需要数周的工作。',
        },
        battleTested: {
          title: '久经考验',
          description: '企业级安全与可靠性。新世界需要力量。',
        },
        growth: {
          title: '指数增长',
          description: '复利你的能力。每一天你都比昨天更强大。',
        },
      },
      cta: {
        headline: '我们是第一艘成功穿越的船。',
        description: '加入正在书写新规则的团队。旧框架、旧敏捷、旧的一切都在这里消亡。',
        button: '进入新世界',
      },
      legends: '传奇正在缔造',
    },
    skyIslands: {
      badge: '空岛',
      headline: '写代码感觉像在',
      headlineHighlight: '作弊',
      description: '欢迎来到开发感觉神奇的升华之地。AI作为超能力。超越人类极限。',
      powers: {
        fullstack: {
          title: '全栈精通',
          description: '前端、后端、基础设施——都在你的意志下统一',
        },
        dimensional: {
          title: '维度思维',
          description: '跨越抽象看问题。理解系统中的系统',
        },
        creative: {
          title: '创意流动',
          description: '想法变为工作代码。障碍消失',
        },
        reflexes: {
          title: '闪电反应',
          description: '瞬间响应变化。在别人察觉之前适应',
        },
      },
      roadmap: {
        title: '古老路线图',
        subtitle: '历史正文指引通往终极宝藏的道路',
        phases: {
          phase1: {
            name: 'Nexus助手',
            description: '你的第一件武器。AI驱动的Chrome扩展。',
          },
          phase2: {
            name: '船',
            description: '完整平台。App.nexuswill.com上线。',
          },
          phase3: {
            name: '船员',
            description: '社区工具、悬赏、酒馆开放。',
          },
          phase4: {
            name: '恶魔果实',
            description: '每个领域的专业AI代理。',
          },
        },
      },
      cta: {
        headline: '全栈工程师成为神',
        description: '在这里你的技能得到升华。你将AI作为意志的延伸，而不仅仅是工具。',
        primary: '升华至空岛',
        secondary: '阅读宣言',
      },
    },
    fleet: {
      badge: '舰队',
      headline: '规划你的航线',
      description: 'Nexus Will生态系统横跨多个领域。每一个都在你穿越伟大航路的旅程中发挥独特作用。',
      footer: '所有领域相互连接。你的进度随你穿越整个舰队。',
      domains: {
        main: {
          name: '伟大航路',
          description: '主要故事中心、博客、宣言、船员招募',
        },
        app: {
          name: '千阳号',
          description: '实际平台——核心产品，你的船',
        },
        helper: {
          name: '第一件武器',
          description: 'Nexus助手——AI驱动的Chrome扩展',
        },
        docs: {
          name: '历史正文',
          description: '技术圣经——文档、API、指南',
        },
        crew: {
          name: '酒馆',
          description: '社区、论坛、悬赏、船员招募',
        },
        ai: {
          name: '恶魔果实',
          description: '未来AI工具——每个领域的专业代理',
        },
      },
      statuses: {
        live: '上线',
        beta: '测试版',
        soon: '即将推出',
      },
    },
    captainsLog: {
      badge: '船长日志',
      headline: '来自',
      headlineHighlight: '伟大航路',
      description: '那些敢于航行这些水域的人的故事。胜利的故事、学到的教训，以及推动我们前进的意志。',
      readMore: '阅读更多',
      viewAll: '查看所有日志',
    },
    crewStories: {
      badge: '船员故事',
      headline: '来自',
      headlineHighlight: '船员',
      description: '听听那些加入我们的航行并在AI海洋中改变旅程的开发者的声音。',
    },
    bountyBoard: {
      badge: '悬赏板',
      headline: '通缉：',
      headlineHighlight: '传奇',
      description: '加入我们的船员，在新世界赢得一席之地。每一次贡献都会得到奖励。',
      bounties: {
        contributor: {
          title: '开源贡献者',
          reward: '5亿',
          description: '向我们的仓库提交PR',
        },
        hunter: {
          title: 'Bug猎人',
          reward: '3亿',
          description: '发现并报告关键Bug',
        },
        evangelist: {
          title: '社区布道者',
          reward: '2亿',
          description: '传播Nexus Will的声音',
        },
      },
    },
    footer: {
      description: '欢迎来到伟大航路。软件开发不再只是一份工作。这是一场冒险。',
      madeWith: '用',
      for: '为伟大航路打造',
      closing: '大海在呼唤。',
      copyright: '© {year} Nexus Will。保留所有权利。',
    },
    theme: {
      light: '浅色',
      dark: '深色',
      system: '系统',
    },
    language: {
      select: '选择语言',
    },
    logPose: {
      title: '记录指针',
    },
  },
  sw: {
    nav: {
      brand: 'Nexus Will',
      setSail: 'Tangaza Safari',
      explore: 'Chunguza',
    },
    hero: {
      badge: 'Wakati wa AI umefika',
      headline1: 'Karibu kwenye',
      headline2: 'Grand Line',
      subline1: 'Ukuaji wa programu sio kazi tena.',
      subline2: 'Ni',
      subline2Highlight: 'safari',
      subline3: 'Bahari ya AI ni kali.',
      subline4: 'Wale tu wenye Mapenzi watasalia.',
      ctaPrimary: 'Tangaza Safari',
      ctaSecondary: 'Chunguza Ramani',
      scrollIndicator: 'Shuka',
      footer: 'Sheria za zamani zimekwisha. AI ni bahari. Mapenzi ni dira.',
      tag1: 'Asili-AI',
      tag2: 'Msanidi Kwanza',
      tag3: 'Kinga ya Baadaye',
    },
    grandLine: {
      badge: 'Grand Line',
      headline: 'Hapa ndipo',
      headlineHighlight: '99%',
      headlineEnd: 'ya timu zinapotea',
      description: 'Uhalisia wa kuchanganya na mzuri wa kuunda programu leo na AI. Maji hatari, changamoto zisizotarajiwa, hadithi zinaanzishwa.',
      quote: 'Tunakupa',
      quoteHighlight: 'Log Pose',
      mapHint: 'Bonyeza visiwa kuvichunguza',
      mapRoute: 'Njia yako',
      islands: {
        bugHell: {
          name: 'Jehanamu la Bug',
          description: 'Vitanzio vya kutatua hitilafu visivyokwisha vinavyoichukua roho yako',
          solution: 'Utambuzi wa hitilafu za AI na kutatua',
        },
        contextLoss: {
          name: 'Ghuba ya Kupoteza Muktadha',
          description: 'Kusahabu kwa nini uliandika huo msimbo siku 3 zilizopita',
          solution: 'Kumbukumbu ya AI inayodumu kote',
        },
        slowTeams: {
          name: 'Ziwa la Timu Polepole',
          description: 'Ukaguzi unachukua milele, kutolewa ni polepole',
          solution: 'Ukaguzi wa msimbo wa kiotomatiki & kutolewa',
        },
        siloIslands: {
          name: 'Visiwa vya Silo',
          description: 'Maarifa yamefungwa katika akili za watu binafsi',
          solution: 'Muktadha wa AI ulioshirikiwa kwa wana wa meli wako wote',
        },
        legacySea: {
          name: 'Bahari ya Msimbo wa Zamani',
          description: 'Msimbo wa kale ambao hakuna mtu anauelewa',
          solution: 'Kihistoria na kisasa cha msimbo wa AI',
        },
      },
    },
    newWorld: {
      badge: 'Dunia Mpya',
      headline: 'Ambapo',
      headlineHighlight: 'wafalme',
      headlineEnd: 'wanatokea',
      description: 'Baada ya muda. Kila kitu ni nguvu zaidi. Hadithi za kweli zinaandikwa hapa. Katika Dunia Mpya, AI haisaidii kuandika msimbo. Inakuwa',
      descriptionHighlight: 'kuwa',
      descriptionEnd: 'msimbo.',
      features: {
        aiNative: {
          title: 'Muundo Asili-AI',
          description: 'Ulijengwa kutoka misingi kwa wakati wa AI. Sio kufungwa, bali kufumwa.',
        },
        lightning: {
          title: 'Haraka Kama Umeme',
          description: 'Mzunguko wa maendeleo mara 10 wa haraka. Tuma katika masaa yanayotumia wiki.',
        },
        battleTested: {
          title: 'Kupigwa Majaribio',
          description: 'Usalama na uimara wa viwango vya biashara. Dunia Mpya inahitaji nguvu.',
        },
        growth: {
          title: 'Ukuaji wa Kipeo',
          description: 'Zidisha uwezo wako. Kila siku unakuwa na nguvu zaidi kuliko jana.',
        },
      },
      cta: {
        headline: 'Sisi ni meli ya kwanza iliyofanikiwa kuvuka.',
        description: 'Jiunge na wana wa meli wanaowaandika sheria mpya. Mfumo wa zamani, agile ya zamani, kila kitu cha zamani hukufa hapa.',
        button: 'Ingia Dunia Mpya',
      },
      legends: 'Hadithi zinazoandikwa',
    },
    skyIslands: {
      badge: 'Visiwa vya Anga',
      headline: 'Ambapo kuandika msimbo kunahisi kama',
      headlineHighlight: 'kudanganya',
      description: 'Karibu kwenye safu iliyoinuliwa ambapo maendeleo yanahisi kama uchawi. AI kama nguvu za ziada. Zaidi ya kikomo cha binadamu.',
      powers: {
        fullstack: {
          title: 'Ustadi wa Fullstack',
          description: 'Mbele, nyuma, miundombinu—yote umoja chini ya Mapenzi yako',
        },
        dimensional: {
          title: 'Mawazo ya Vipimo',
          description: 'Ona kote kwenye utata. Elewa mifumo ndani ya mifumo',
        },
        creative: {
          title: 'Mtiririko wa Ubunifu',
          description: 'Mawazo yanadhihirika kama msimbo unaofanya kazi. Kizuizi kinatoweka',
        },
        reflexes: {
          title: 'Majibu ya Umeme',
          description: 'Jibu mabadiliko mara moja. Rekebisha kabla ya wengine kutambua',
        },
      },
      roadmap: {
        title: 'Ramani ya Kale',
        subtitle: 'Poneglyphs zinaongoza njia kwenda hazina ya mwisho',
        phases: {
          phase1: {
            name: 'Msaidizi wa Nexus',
            description: 'Silaha yako ya kwanza. Ugani wa Chrome kwa ajili ya kuandika AI.',
          },
          phase2: {
            name: 'Meli',
            description: 'Jukwaa kamili. App.nexuswill.com inaanza.',
          },
          phase3: {
            name: 'Wana wa Meli',
            description: 'Zana za jamii, zawadi, baa lafunguliwa.',
          },
          phase4: {
            name: 'Matunda ya Shetani',
            description: 'Wakala wa AI maalum kwa kila k eneo.',
          },
        },
      },
      cta: {
        headline: 'Wahandisi wa Fullstack wanakuwa miungu',
        description: 'Hapa ni mahali ambapo ustadi wako unapanda. Ambapo unatumia AI sio kama zana, bali kama ugani wa Mapenzi yako.',
        primary: 'Panda hadi Visiwa vya Anga',
        secondary: 'Soma Manifesto',
      },
    },
    fleet: {
      badge: 'Fleet',
      headline: 'Chora njia yako',
      description: 'Mfumo wa Nexus Will unanuka nyanja nyingi. Kila moja inahudumia kusudi maalum katika safari yako kote Grand Line.',
      footer: 'Nyanja zote zimeunganishwa. Maendeleo yako husafiri nawe kote fleet.',
      domains: {
        main: {
          name: 'Grand Line',
          description: 'Kituo kikuu cha hadithi, blogu, manifesto, uajiri wa wana wa meli',
        },
        app: {
          name: 'Thousand Sunny',
          description: 'Jukwaa la kweli — bidhaa kuu, meli yako',
        },
        helper: {
          name: 'Silaha ya Kwanza',
          description: 'Msaidizi wa Nexus — ugani wa Chrome kwa ajili ya kuandika AI',
        },
        docs: {
          name: 'Poneglyphs',
          description: 'Biblia ya kiufundi — nyaraka, API, miongozo',
        },
        crew: {
          name: 'Baa',
          description: 'Jamii, majukwaa, zawadi, uajiri wa wana wa meli',
        },
        ai: {
          name: 'Matunda ya Shetani',
          description: 'Zana za AI za baadaye — wakala maalum kwa kila k eneo',
        },
      },
      statuses: {
        live: 'Hai',
        beta: 'Beta',
        soon: 'Hivi Karibuni',
      },
    },
    captainsLog: {
      badge: 'Logi ya Kapteni',
      headline: 'Hadithi kutoka',
      headlineHighlight: 'Grand Line',
      description: 'Kroniki za wale waliojasiri kuvuka maji haya. Hadithi za ushindi, masomo yaliyojifunza, na Mapenzi yanayotutia mbele.',
      readMore: 'Soma Zaidi',
      viewAll: 'Ona Logi Zote',
    },
    crewStories: {
      badge: 'Hadithi za Wana wa Meli',
      headline: 'Sauti kutoka',
      headlineHighlight: 'Wana wa Meli',
      description: 'Sikia kutoka kwa wasanidi programu waliojiunga na safari yetu na kubadilisha safari yao kote bahari za AI.',
    },
    bountyBoard: {
      badge: 'Bodi ya Zawadi',
      headline: 'Wanaotafutwa:',
      headlineHighlight: 'Hadithi',
      description: 'Jiunge na wana wa meli wetu upate nafasi yako katika Dunia Mpya. Mchango kila mmoja unalipwa.',
      bounties: {
        contributor: {
          title: 'Mchangiaji wa Open Source',
          reward: '500M',
          description: 'Wasilisha PR kwenye hazina zetu',
        },
        hunter: {
          title: 'Mwindaji wa Bug',
          reward: '300M',
          description: 'Tafuta ripoti muhimu za hitilafu',
        },
        evangelist: {
          title: ' Mwinjilist wa Jamii',
          reward: '200M',
          description: 'Sema habari za Nexus Will',
        },
      },
    },
    footer: {
      description: 'Karibu kwenye Grand Line. Ukuaji wa programu sio kazi tena. Ni safari.',
      madeWith: 'Imetengenezwa kwa',
      for: 'kwa ajili ya Grand Line',
      closing: 'Bahari inaita.',
      copyright: '© {year} Nexus Will. Haki zote zimehifadhiwa.',
    },
    theme: {
      light: 'Nuru',
      dark: 'Giza',
      system: 'Mfumo',
    },
    language: {
      select: 'Chagua Lugha',
    },
    logPose: {
      title: 'Log Pose',
    },
  },
  ja: {
    nav: {
      brand: 'Nexus Will',
      setSail: '出航',
      explore: '探検',
    },
    hero: {
      badge: 'AIの時代が来た',
      headline1: 'ようこそ',
      headline2: '偉大なる航路へ',
      subline1: 'ソフトウェア開発はもはや仕事ではない。',
      subline2: 'それは',
      subline2Highlight: '冒険',
      subline3: 'AIの海は荒れている。',
      subline4: '意志を持つ者だけが生き残る。',
      ctaPrimary: '出航',
      ctaSecondary: '地図を探検',
      scrollIndicator: '降下',
      footer: '古いルールは消えた。AIが海。意志が羅針盤。',
      tag1: 'AIネイティブ',
      tag2: '開発者優先',
      tag3: '未来対応',
    },
    grandLine: {
      badge: '偉大なる航路',
      headline: 'ここは',
      headlineHighlight: '99%',
      headlineEnd: 'のチームが迷う場所',
      description: 'AIでソフトウェアを構築する混沌と美の現実。危険な海域、予期せぬ挑戦、伝説が生まれる。',
      quote: '私たちがあなたに与えるのは',
      quoteHighlight: '記録指針',
      mapHint: '島をクリックして探検',
      mapRoute: 'あなたの航路',
      islands: {
        bugHell: {
          name: 'バグの地獄',
          description: '魂を draining する終わりなきデバッグループ',
          solution: 'AI駆動のエラー検出と解決',
        },
        contextLoss: {
          name: 'コンテキスト喪失の入り江',
          description: '3日前なぜそのコードを書いたか忘れる',
          solution: 'セッションを超える永続的なAI記憶',
        },
        slowTeams: {
          name: '遅いチームの湖',
          description: 'レビューに永遠にかかり、リリースは遅い',
          solution: '自動コードレビューとデプロイ',
        },
        siloIslands: {
          name: 'サイロの島々',
          description: '知識が個人の頭の中に閉じ込められる',
          solution: 'クルー全体で共有されるAIコンテキスト',
        },
        legacySea: {
          name: 'レガシーコードの海',
          description: '誰も理解していない古代のコードベース',
          solution: 'AIコード考古学と近代化',
        },
      },
    },
    newWorld: {
      badge: '新世界',
      headline: '',
      headlineHighlight: '王者',
      headlineEnd: 'が現れる場所',
      description: 'タイムスキップ後。すべてが強くなる。本当の伝説はここで作られる。新世界では、AIはコーディングを手伝わない。それはコードに',
      descriptionHighlight: 'なる',
      descriptionEnd: '。',
      features: {
        aiNative: {
          title: 'AIネイティブアーキテクチャ',
          description: 'AI時代のために一から構築。後付けではなく、組み込まれている。',
        },
        lightning: {
          title: '稲妻のような速さ',
          description: '10倍速い開発サイクル。週単位だったものを時間単位で出荷。',
        },
        battleTested: {
          title: '戦闘検証済み',
          description: 'エンタープライズグレードのセキュリティと信頼性。新世界は強さを求める。',
        },
        growth: {
          title: '指数関数的成長',
          description: '能力を複利で増やす。毎日、昨日より強くなる。',
        },
      },
      cta: {
        headline: '私たちは最初に横断した船だ。',
        description: '新しいルールを書いているクルーに参加しよう。古いフレームワーク、古いアジャイル、古いすべてがここで死ぬ。',
        button: '新世界へ入る',
      },
      legends: '伝説の創造中',
    },
    skyIslands: {
      badge: '空島',
      headline: 'コーディングが',
      headlineHighlight: 'チート',
      description: '開発が魔法のように感じられる高次の領域へようこそ。AIを超能力として。人間の限界を超えて。',
      powers: {
        fullstack: {
          title: 'フルスタックマスタリー',
          description: 'フロントエンド、バックエンド、インフラ—すべてがあなたの意志のもとに統一される',
        },
        dimensional: {
          title: '次元思考',
          description: '抽象化を超えて見る。システム内のシステムを理解する',
        },
        creative: {
          title: '創造的フロー',
          description: 'アイデアが動作するコードとして具現化。障壁が溶ける',
        },
        reflexes: {
          title: '稲妻の反射神経',
          description: '変化に即座に反応。他者が感知する前に適応する',
        },
      },
      roadmap: {
        title: '古のロードマップ',
        subtitle: '歴史の本文が究極の宝への道を示す',
        phases: {
          phase1: {
            name: 'Nexusヘルパー',
            description: '最初の武器。AI駆動コーディングのChrome拡張。',
          },
          phase2: {
            name: '船',
            description: '完全なプラットフォーム。App.nexuswill.comがオンラインに。',
          },
          phase3: {
            name: 'クルー',
            description: 'コミュニティツール、賞金、酒場が開く。',
          },
          phase4: {
            name: '悪魔の実',
            description: 'あらゆる領域の専門AIエージェント。',
          },
        },
      },
      cta: {
        headline: 'フルスタックエンジニアが神となる',
        description: 'ここはあなたのスキルが超越する場所。AIを道具ではなく、意志の延長として振るう場所。',
        primary: '空島へ昇天',
        secondary: 'マニフェストを読む',
      },
    },
    fleet: {
      badge: '艦隊',
      headline: '航路を描け',
      description: 'Nexus Willエコシステムは複数のドメインにまたがる。それぞれが偉大なる航路を横断する旅で独自の役割を果たす。',
      footer: 'すべてのドメインは相互接続されている。進捗は艦隊全体であなたと共に移動する。',
      domains: {
        main: {
          name: '偉大なる航路',
          description: '主要ストーリーハブ、ブログ、マニフェスト、クルー募集',
        },
        app: {
          name: 'サウザンドサニー号',
          description: '実際のプラットフォーム—コアプロダクト、あなたの船',
        },
        helper: {
          name: '最初の武器',
          description: 'Nexusヘルパー—AI駆動コーディングのChrome拡張',
        },
        docs: {
          name: '歴史の本文',
          description: '技術の聖書—ドキュメント、API、ガイド',
        },
        crew: {
          name: '酒場',
          description: 'コミュニティ、フォーラム、賞金、クルー募集',
        },
        ai: {
          name: '悪魔の実',
          description: '未来のAIツール—あらゆる領域の専門エージェント',
        },
      },
      statuses: {
        live: '稼働中',
        beta: 'ベータ',
        soon: '近日公開',
      },
    },
    captainsLog: {
      badge: '船長日誌',
      headline: 'からの物語',
      headlineHighlight: '偉大なる航路',
      description: 'これらの海域を航行することを敢えて試みた者たちの記録。勝利の物語、学んだ教訓、そして私たちを前進させる意志。',
      readMore: '続きを読む',
      viewAll: 'すべての日誌を見る',
    },
    crewStories: {
      badge: 'クルーの物語',
      headline: 'からの声',
      headlineHighlight: 'クルー',
      description: '私たちの航海に参加し、AIの海で彼らの旅を変えた開発者たちからの声を聞こう。',
    },
    bountyBoard: {
      badge: '賞金掲示板',
      headline: '手配：',
      headlineHighlight: '伝説',
      description: '私たちのクルーに参加し、新世界であなたの地位を勝ち取ろう。すべての貢献に報酬がある。',
      bounties: {
        contributor: {
          title: 'オープンソース貢献者',
          reward: '5億',
          description: 'リポジトリにPRを提出',
        },
        hunter: {
          title: 'バグハンター',
          reward: '3億',
          description: '重大なバグを発見・報告',
        },
        evangelist: {
          title: 'コミュニティ伝道者',
          reward: '2億',
          description: 'Nexus Willの言葉を広める',
        },
      },
    },
    footer: {
      description: '偉大なる航路へようこそ。ソフトウェア開発はもはや仕事ではない。それは冒険だ。',
      madeWith: 'で作られた',
      for: '偉大なる航路のために',
      closing: '海が呼んでいる。',
      copyright: '© {year} Nexus Will. All rights reserved.',
    },
    theme: {
      light: 'ライト',
      dark: 'ダーク',
      system: 'システム',
    },
    language: {
      select: '言語を選択',
    },
    logPose: {
      title: '記録指針',
    },
  },
  zu: {
    nav: {
      brand: 'Nexus Will',
      setSail: 'Qala Ikhosi',
      explore: 'Hlola',
    },
    hero: {
      badge: 'Isikhathi se-AI sifikile',
      headline1: 'Siyakwamukela ku',
      headline2: 'Grand Line',
      subline1: 'Ukuthuthukisa software akusikho umsebenzi.',
      subline2: 'Luhambo',
      subline2Highlight: 'lwezobungcweti',
      subline3: 'Ulwandle lwe-AI luyabusa.',
      subline4: 'Abanethemba kuphela abayophila.',
      ctaPrimary: 'Qala Ikhosi',
      ctaSecondary: 'Hlola Imephu',
      scrollIndicator: 'Ihlehla',
      footer: 'Imithetho yasendulo yaphela. I-AI ulwandle. Ithemba yinkomba.',
      tag1: 'Okokuqala-AI',
      tag2: 'Umqondisi Kuqala',
      tag3: 'Ivikele Ikusasa',
    },
    grandLine: {
      badge: 'Grand Line',
      headline: 'Lapha',
      headlineHighlight: '99%',
      headlineEnd: 'yezinhlangano zilahlekelwa',
      description: 'Inkolelo yokuchitha nokuhle yokakha usofthiwe namuhla nge-AI. Amanzi angozi, izinselelo ezingalindelekile, amaqoqo aqanjwa.',
      quote: 'Sikunika',
      quoteHighlight: 'I-Log Pose',
      mapHint: 'Chofoza iziqhingi ukuzihlola',
      mapRoute: 'Indlela yakho',
      islands: {
        bugHell: {
          name: 'Ijehova le-Bug',
          description: 'Amaphuzu okulungisa amaphutha angapheli aphuma emoyeni wakho',
          solution: 'Ukuqaphela nokuxazulula amaphutha nge-AI',
        },
        contextLoss: {
          name: 'Ithi yokulahlekelwa Yikonteksthi',
          description: 'Ukhohlwa ukuthi kwenzekeni ukuthi ubhale leyo khodi izinsuku ezintathu ezidlule',
          solution: 'Ukhumbulo lwe-AI oluqhubekayo kuzo zonke izikhathi',
        },
        slowTeams: {
          name: 'Inzi yenhloko yeqembu elicwayizayo',
          description: 'Ukuhlolisisa kuthatha isikhathi eside, ukukhishwa kucwayiza',
          solution: 'Ukuhlolisisa kwekhodi okuzenzekelayo nokukhishwa',
        },
        siloIslands: {
          name: 'Iziqhingi ze-Silo',
          description: 'Ukwaziswa kuvalelwe emqondisweni wabantu abodwa',
          solution: 'Ikonteksthi ywe-AI ehlanganyelwe yabo bonke abantu besikhephe sakho',
        },
        legacySea: {
          name: 'Ulwandle lwekhodi yasendulo',
          description: 'Isikhwama sekhodi sakudala akukho muntu owusiqondayo',
          solution: 'I-AI yokufuna imvelo yekhodi nokwamukela kwesimanje',
        },
      },
    },
    newWorld: {
      badge: 'Umhlaba Omusha',
      headline: 'Lapho',
      headlineHighlight: 'amakhosi',
      headlineEnd: 'avela khona',
      description: 'Ngemuva kwesikhathi. Konke kuyamaqhinga. Amaqhinga angempela aqanjwa lapha. Emhlabeni Omusha, I-AI ayikusizi ukubhala ikhodi. Iba',
      descriptionHighlight: 'yikhodi',
      descriptionEnd: 'lenkampani.',
      features: {
        aiNative: {
          title: 'Isakhiwo Esingama-AI',
          description: 'Sakhelwe kusukela emfundeni kwesikhathi se-AI. Akusikho ukufakwa, kodwa kufakwa ngaphakathi.',
        },
        lightning: {
          title: 'Ukushesha Okungathi Umemezi',
          description: 'Izinkathi zokuthuthukisa ezingu-10 xsheshisa. Thumela emahoreni okwenza okuthatha amaviki.',
        },
        battleTested: {
          title: 'Kuhlolwe Empini',
          description: 'Ukhuseleko nokuqiniseka kwamazinga ebhizinisi. Umhlaba omusha udinga amandla.',
        },
        growth: {
          title: 'Ukhula Okuphindwe kabili',
          description: 'Qanjula amakhono akho. Usuku ngalunye uya wuthi uqine kunalolo olwedlule.',
        },
      },
      cta: {
        headline: 'Thina yisikhephe sokuqala esasidlula ngempumelelo.',
        description: 'Joyina iqembu elibhala imithetho emisha. Amafremu endulo, i-agile endulo, konke endulo kufela lapha.',
        button: 'Ngena Emhlabeni Omusha',
      },
      legends: 'Amaqhinga eqanjwa',
    },
    skyIslands: {
      badge: 'Iziqhingi zezulu',
      headline: 'Lapho ukubhala ikhodi kunemuva okungathi',
      headlineHighlight: 'ukukhohlisa',
      description: 'Siyakwamukela endaweni ephezulu lapho ukuthuthukisa kunemuva ngokomlingo. I-AI njengamandla angaphezulu. Ngaphezu kwemingcele yabantu.',
      powers: {
        fullstack: {
          title: 'Ukuba yi-Fullstack',
          description: 'I-frontend, i-backend, isiseko—konke kuhlanganyelwe phansi kwethemba lakho',
        },
        dimensional: {
          title: 'Ukuqonda kwezimo ezahlukene',
          description: 'Buka ngaphaya kwemibono. Qonda izinhlelo ngaphakathi kwezinhlelo',
        },
        creative: {
          title: 'Ukuphuma Kobuciko',
          description: 'Imibono ivele njengekhodi esebenzayo. Isivimbelo siyanyamalala',
        },
        reflexes: {
          title: 'Izindlebe ezisheshayo',
          description: 'Phendula ushintsho ngokushesha. Lungisa ngaphambi kokuba abanye baqaphele',
        },
      },
      roadmap: {
        title: 'Imephu Yasendulo',
        subtitle: 'Ama-Poneglyphs akhombisa indlela eya emfuthweni yokugcina',
        phases: {
          phase1: {
            name: 'Umsizi we-Nexus',
            description: 'Isikhwama sakho sokuqala. Isandiso se-Chrome sokubhala nge-AI.',
          },
          phase2: {
            name: 'Isikhephe',
            description: 'Iphlatformi ephelele. I-App.nexuswill.com iya kuqala.',
          },
          phase3: {
            name: 'Iqembu',
            description: 'Amathuluzi omphakathi, imali engeniso, ibha livulekile.',
          },
          phase4: {
            name: 'Izithelo zomoya omubi',
            description: 'Ama-agent we-AI akhethekilele yileyo naleyo indawo.',
          },
        },
      },
      cta: {
        headline: 'Abaphathi be-Fullstack baba ngonkulunkulu',
        description: 'Leli yindawo lapho amakhono akho aphuma khona. Lapho usebenzisa i-AI hhayi njengethuluzi, kodwa njengokwandisa kwethemba lakho.',
        primary: 'Khuphukela ezinqeni zezulu',
        secondary: 'Funda iManifesto',
      },
    },
    fleet: {
      badge: 'Ifleet',
      headline: 'Zoba indlela yakho',
      description: 'I-Nexus Will ecosystem yaba lezindawo eziningi. Yileyo naleyo ikhipha injongo eyodwa ehambweni lakho kuGrand Line.',
      footer: 'Zonke izindawo zixhumene. Inqubekela phambili yakho ihamba nawe kulo lonke ifleet.',
      domains: {
        main: {
          name: 'Grand Line',
          description: 'Isikhumba sendaba, ibhulogi, imanifesto, ukuqashwa kweqembu',
        },
        app: {
          name: 'I-Thousand Sunny',
          description: 'Iphlatformi yangempela—umkhiqizo oyinhloko, isikhephe sakho',
        },
        helper: {
          name: 'Isikhwama sokuqala',
          description: 'Umsizi we-Nexus—isandiso se-Chrome sokubhala nge-AI',
        },
        docs: {
          name: 'Ama-Poneglyphs',
          description: 'Incwadi yobunzima—amadokhumenti, i-API, imiqondo',
        },
        crew: {
          name: 'Ibha',
          description: 'Umphakathi, amaforamu, imali engeniso, ukuqashwa kweqembu',
        },
        ai: {
          name: 'Izithelo zomoya omubi',
          description: 'Amathuluzi we-AI wesikhathi esizayo—ama-agent akhethekile yileyo naleyo indawo',
        },
      },
      statuses: {
        live: 'Iphilayo',
        beta: 'Ibeta',
        soon: 'Kusezakuba',
      },
    },
    captainsLog: {
      badge: 'Incwadi Yomlawuli',
      headline: 'Izindaba ezivela ku',
      headlineHighlight: 'Grand Line',
      description: 'Izigcawu zabantu abanesibindi sokweta lawa manzi. Izindaba zophumelelo, izifundo ezifundiwe, nethemba eliqhubekela phambili.',
      readMore: 'Funda Okuningi',
      viewAll: 'Buka Zonke Izigcawu',
    },
    crewStories: {
      badge: 'Izindaba Zeqembu',
      headline: 'Izwi elivela ku',
      headlineHighlight: 'Iqembu',
      description: 'Lalela kubaphathi besoftiwe abajoyine uhambo lwethu futhi baguqula uhambo lwabo kulo lonke ulwandle lwe-AI.',
    },
    bountyBoard: {
      badge: 'Ibhodi Lemali Engeniso',
      headline: 'Abafunwayo:',
      headlineHighlight: 'Amaqhinga',
      description: 'Joyina iqembu lethu ukuze uthole indawo yakho emhlabeni omusha. Konke okulethwa kuvuzwa.',
      bounties: {
        contributor: {
          title: 'Umlethi Womthombo Ovulekile',
          reward: '500M',
          description: 'Thumela ama-PR ku-repos yethu',
        },
        hunter: {
          title: 'Umzingeli We-Bug',
          reward: '300M',
          description: 'Thola ubike ama-bug abalulekile',
        },
        evangelist: {
          title: 'Umeshi Womphakathi',
          reward: '200M',
          description: 'Sakaza izwi nge-Nexus Will',
        },
      },
    },
    footer: {
      description: 'Siyakwamukela kuGrand Line. Ukuthuthukisa software akusikho umsebenzi. Luhambo.',
      madeWith: 'Yakhiwe nge',
      for: 'kuGrand Line',
      closing: 'Ulwandle luyabiza.',
      copyright: '© {year} Nexus Will. Onke amalungelo agodliwe.',
    },
    theme: {
      light: 'Ukukhanya',
      dark: 'Ubumnyama',
      system: 'Isistimu',
    },
    language: {
      select: 'Khetha Ulimi',
    },
    logPose: {
      title: 'I-Log Pose',
    },
  },
  ru: {
    nav: {
      brand: 'Nexus Will',
      setSail: 'В путь',
      explore: 'Исследовать',
    },
    hero: {
      badge: 'Эра ИИ наступила',
      headline1: 'Добро пожаловать на',
      headline2: 'Гранд Лайн',
      subline1: 'Разработка ПО — это больше не работа.',
      subline2: 'Это',
      subline2Highlight: 'приключение',
      subline3: 'Море ИИ бушует.',
      subline4: 'Выживут только те, у кого есть Воля.',
      ctaPrimary: 'В путь',
      ctaSecondary: 'Изучить карту',
      scrollIndicator: 'Вниз',
      footer: 'Старые правила исчезли. ИИ — это море. Воля — это компас.',
      tag1: 'ИИ-нативный',
      tag2: 'Для разработчиков',
      tag3: 'На будущее',
    },
    grandLine: {
      badge: 'Гранд Лайн',
      headline: 'Здесь',
      headlineHighlight: '99%',
      headlineEnd: 'команд теряются',
      description: 'Хаотичная и прекрасная реальность создания ПО с ИИ. Опасные воды, неожиданные вызовы, рождение легенд.',
      quote: 'Мы даём тебе',
      quoteHighlight: 'Лог Поуз',
      mapHint: 'Нажмите на острова для исследования',
      mapRoute: 'Ваш маршрут',
      islands: {
        bugHell: {
          name: 'Ад багов',
          description: 'Бесконечные циклы отладки, опустошающие душу',
          solution: 'Обнаружение и исправление ошибок с помощью ИИ',
        },
        contextLoss: {
          name: 'Бухта потери контекста',
          description: 'Забыл, зачем написал этот код 3 дня назад',
          solution: 'Постоянная память ИИ между сессиями',
        },
        slowTeams: {
          name: 'Лагуна медленных команд',
          description: 'Ревью длится вечность, релизы ползут',
          solution: 'Автоматический код-ревью и деплой',
        },
        siloIslands: {
          name: 'Острова силосов',
          description: 'Знания заперты в головах отдельных людей',
          solution: 'Общий ИИ-контекст для всей команды',
        },
        legacySea: {
          name: 'Море legacy-кода',
          description: 'Древний код, который никто не понимает',
          solution: 'ИИ-археология кода и модернизация',
        },
      },
    },
    newWorld: {
      badge: 'Новый Мир',
      headline: 'Где',
      headlineHighlight: 'короли',
      headlineEnd: 'рождаются',
      description: 'После таймскипа. Всё стало сильнее. Настоящие легенды создаются здесь. В Новом Мире ИИ не помогает писать код. Он',
      descriptionHighlight: 'становится',
      descriptionEnd: 'кодом.',
      features: {
        aiNative: {
          title: 'ИИ-нативная архитектура',
          description: 'Построено с нуля для эры ИИ. Не прикручено, а вплетено.',
        },
        lightning: {
          title: 'Молниеносная скорость',
          description: 'В 10 раз быстрее циклы разработки. Отправляй за часы то, что занимало недели.',
        },
        battleTested: {
          title: 'Проверено в бою',
          description: 'Безопасность и надёжность корпоративного уровня. Новый Мир требует силы.',
        },
        growth: {
          title: 'Экспоненциальный рост',
          description: 'Наращивай способности. Каждый день ты сильнее, чем вчера.',
        },
      },
      cta: {
        headline: 'Мы — первый корабль, который прошёл.',
        description: 'Присоединяйся к команде, которая пишет новые правила. Старые фреймворки, старый agile — всё умирает здесь.',
        button: 'Войти в Новый Мир',
      },
      legends: 'Легенды в процессе создания',
    },
    skyIslands: {
      badge: 'Небесные острова',
      headline: 'Где программирование ощущается как',
      headlineHighlight: 'читерство',
      description: 'Добро пожаловать на возвышенный уровень, где разработка ощущается как магия. ИИ как суперсилы. За пределами человеческих возможностей.',
      powers: {
        fullstack: {
          title: 'Мастерство фулстека',
          description: 'Фронтенд, бэкенд, инфраструктура — всё объединено под твоей Волей',
        },
        dimensional: {
          title: 'Многомерное мышление',
          description: 'Видеть сквозь абстракции. Понимать системы внутри систем',
        },
        creative: {
          title: 'Творческий поток',
          description: 'Идеи материализуются как рабочий код. Барьер растворяется',
        },
        reflexes: {
          title: 'Молниеносные рефлексы',
          description: 'Реагируй на изменения мгновенно. Адаптируйся раньше других',
        },
      },
      roadmap: {
        title: 'Древняя дорожная карта',
        subtitle: 'Понеглифы указывают путь к главному сокровищу',
        phases: {
          phase1: {
            name: 'Nexus Helper',
            description: 'Твоё первое оружие. Chrome-расширение для ИИ-кодинга.',
          },
          phase2: {
            name: 'Корабль',
            description: 'Полная платформа. App.nexuswill.com выходит в море.',
          },
          phase3: {
            name: 'Команда',
            description: 'Инструменты сообщества, награды, таверна открывается.',
          },
          phase4: {
            name: 'Дьявольские плоды',
            description: 'Специализированные ИИ-агенты для каждой области.',
          },
        },
      },
      cta: {
        headline: 'Фулстек-инженеры становятся богами',
        description: 'Здесь твои навыки выходят за пределы. Здесь ты используешь ИИ не как инструмент, а как продолжение своей Воли.',
        primary: 'Подняться на Небесные острова',
        secondary: 'Прочитать манифест',
      },
    },
    fleet: {
      badge: 'Флот',
      headline: 'Проложи свой курс',
      description: 'Экосистема Nexus Will охватывает множество доменов. Каждый служит уникальной цели в твоём путешествии по Гранд Лайн.',
      footer: 'Все домены взаимосвязаны. Твой прогресс путешествует с тобой по всему флоту.',
      domains: {
        main: {
          name: 'Гранд Лайн',
          description: 'Главный сторителлинг-хаб, блог, манифест, набор команды',
        },
        app: {
          name: 'Таузанд Санни',
          description: 'Сама платформа — основной продукт, твой корабль',
        },
        helper: {
          name: 'Первое оружие',
          description: 'Nexus Helper — Chrome-расширение для ИИ-кодинга',
        },
        docs: {
          name: 'Понеглифы',
          description: 'Техническая библия — документация, API, гайды',
        },
        crew: {
          name: 'Таверна',
          description: 'Сообщество, форумы, награды, набор команды',
        },
        ai: {
          name: 'Дьявольские плоды',
          description: 'Будущие ИИ-инструменты — специализированные агенты для каждой области',
        },
      },
      statuses: {
        live: 'Запущено',
        beta: 'Бета',
        soon: 'Скоро',
      },
    },
    captainsLog: {
      badge: 'Журнал капитана',
      headline: 'Истории с',
      headlineHighlight: 'Гранд Лайн',
      description: 'Хроники тех, кто осмелился плыть по этим водам. Истории побед, извлечённые уроки и Воля, которая движет нас вперёд.',
      readMore: 'Читать далее',
      viewAll: 'Все записи',
    },
    crewStories: {
      badge: 'Истории команды',
      headline: 'Голоса из',
      headlineHighlight: 'Команды',
      description: 'Послушайте разработчиков, которые присоединились к нашему плаванию и изменили свой путь в морях ИИ.',
    },
    bountyBoard: {
      badge: 'Доска наград',
      headline: 'Разыскиваются:',
      headlineHighlight: 'Легенды',
      description: 'Присоединяйся к команде и займи своё место в Новом Мире. Каждый вклад вознаграждается.',
      bounties: {
        contributor: {
          title: 'Контрибьютор Open Source',
          reward: '500М',
          description: 'Отправляй PR в наши репозитории',
        },
        hunter: {
          title: 'Охотник за багами',
          reward: '300М',
          description: 'Находи и сообщай о критических багах',
        },
        evangelist: {
          title: 'Евангелист сообщества',
          reward: '200М',
          description: 'Расскажи миру о Nexus Will',
        },
      },
    },
    footer: {
      description: 'Добро пожаловать на Гранд Лайн. Разработка ПО — это больше не работа. Это приключение.',
      madeWith: 'Сделано с',
      for: 'для Гранд Лайн',
      closing: 'Море зовёт.',
      copyright: '© {year} Nexus Will. Все права защищены.',
    },
    theme: {
      light: 'Светлая',
      dark: 'Тёмная',
      system: 'Системная',
    },
    language: {
      select: 'Выбрать язык',
    },
    logPose: {
      title: 'Лог Поуз',
    },
  },
};

export type Translations = typeof translations.en;
