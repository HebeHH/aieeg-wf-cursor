<header className="bg-main-primary-950 dark:bg-main-primary-700 text-main-primary-50 dark:text-main-primary-300">
    <nav className="container mx-auto px-4 py-1 md:py-6 flex justify-between items-center">
        <ul className="flex space-x-2 md:space-x-4 items-center">
            <li>
                <Link
                    href="/about"
                    className="hover:text-main-secondary-500"
                >
                    <Image
                        src="/layout/HebeCatCrop.jpg"
                        width={45}
                        height={45}
                        alt={"About me"}
                        className="rounded-full w-7 md:w-12 h-7 md:h-12"
                    />
                </Link>
            </li>
            <li className="group">
                <Link
                    href="/"
                    className="text-2xl font-gruppo"
                >
                    s
                    <span className="font-bold text-main-primary-400 dark:text-main-primary-50 group-hover:text-main-secondary-500">
                        hebe
                    </span>
                    coding
                </Link>
            </li>
        </ul>
        <ul className="flex md:space-x-4 space-x-2 items-center">
            <li>
                <EggSVG
                    eggId="circuit"
                    eggMessage={
                        <p>
                            Changing the color of an SVG on
                            hover is tricky - check out{" "}
                            <a
                                href="http://gist.github.com/HebeHH/a27cad60df5d70fb725b63e749a791b2"
                                target="_blank"
                            >
                                my gist
                            </a>{" "}
                            for a solution.
                        </p>
                    }
                    targetLink="https://github.com/hebehh"
                    alt="Github handle"
                    src="/layout/github.svg"
                    color="var(--main-primary-300)"
                    hoverColor="var(--main-secondary-500)"
                />
            </li>
            <li>
                <EggSVG
                    eggId="circuit"
                    eggMessage={
                        <p>
                            Changing the color of an SVG on
                            hover is tricky - check out{" "}
                            <a
                                href="http://gist.github.com/HebeHH/a27cad60df5d70fb725b63e749a791b2"
                                target="_blank"
                            >
                                my gist
                            </a>{" "}
                            for a solution.
                        </p>
                    }
                    targetLink="https://bsky.app/profile/shebecoding.bsky.social"
                    alt="Bluesky handle"
                    src="/layout/bluesky.svg"
                    color="var(--main-primary-300)"
                    hoverColor="var(--main-secondary-500)"
                />
            </li>
            <li>
                <EggSVG
                    eggId="circuit"
                    eggMessage={
                        <p>
                            Changing the color of an SVG on
                            hover is tricky - check out{" "}
                            <a
                                href="http://gist.github.com/HebeHH/a27cad60df5d70fb725b63e749a791b2"
                                target="_blank"
                            >
                                my gist
                            </a>{" "}
                            for a solution.
                        </p>
                    }
                    targetLink="https://x.com/hebehilhorst"
                    alt="Twitter handle"
                    src="/layout/twitter.svg"
                    color="var(--main-primary-300)"
                    hoverColor="var(--main-secondary-500)"
                />
            </li>
            <li className="hidden md:block">
                <EggSVG
                    eggId="circuit"
                    eggMessage={
                        <p>
                            Changing the color of an SVG on
                            hover is tricky - check out
                            <a
                                href="http://gist.github.com/HebeHH/a27cad60df5d70fb725b63e749a791b2"
                                target="_blank"
                            >
                                my gist
                            </a>{" "}
                            for a solution.
                        </p>
                    }
                    targetLink="https://www.linkedin.com/in/hebehilhorst/"
                    alt="LinkedIn handle"
                    src="/layout/linkedin.svg"
                    color="var(--main-primary-300)"
                    hoverColor="var(--main-secondary-500)"
                />
            </li>
        </ul>
    </nav>
</header>