import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";
import GroupCard from "@/components/cards/GroupCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchGroups } from "@/lib/actions/group.actions";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchGroups({
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });

  return (
    <>
      <h1 className='head-text'>Groups</h1>

      <div className='mt-5'>
        <Searchbar routeType='groups' />
      </div>

      <section className='mt-9 flex flex-wrap gap-4'>
        {result.groups.length === 0 ? (
          <p className='no-result'>No Result</p>
        ) : (
          <>
            {result.groups.map((group) => (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                username={group.username}
                imgUrl={group.image}
                bio={group.bio}
                members={group.members}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path='groups'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}

export default Page;
